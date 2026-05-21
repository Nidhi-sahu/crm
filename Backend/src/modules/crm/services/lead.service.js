const leadRepo = require('../repositories/lead.repository');
const enquiryRepo = require('../repositories/enquiry.repository');
const qualificationRepo = require('../repositories/qualification.repository');
const leadStageRepo = require('../repositories/leadStage.repository');
const leadStageHistoryRepo = require('../repositories/leadStageHistory.repository');
const workflowEngine = require('./workflow.engine');
const ApiError = require('../../../utils/ApiError');
const { buildSkip } = require('../../../utils/pagination');
const {
  ENQUIRY_STATUS,
  QUALIFICATION_STATUS,
  LEAD_STATUS,
  LEAD_TERMINAL_STATUSES,
} = require('../../../constants/statuses');

const createFromEnquiry = async (enquiryId, actor) => {
  const enquiry = await enquiryRepo.findById(enquiryId);
  if (!enquiry) throw ApiError.notFound('Enquiry not found');
  if (enquiry.status !== ENQUIRY_STATUS.QUALIFIED) {
    throw ApiError.badRequest(`Enquiry must be in 'qualified' status, currently '${enquiry.status}'`);
  }

  const existing = await leadRepo.findByEnquiryId(enquiryId);
  if (existing) throw ApiError.conflict('Lead already exists for this enquiry');

  const qualification = await qualificationRepo.findByEnquiryId(enquiryId);
  if (!qualification || qualification.qualificationStatus !== QUALIFICATION_STATUS.QUALIFIED) {
    throw ApiError.badRequest('Qualification for this enquiry is not in qualified state');
  }

  const initialStage =
    (await leadStageRepo.findInitial()) || (await leadStageRepo.findFirstActive());
  if (!initialStage) throw ApiError.badRequest('No active stages configured — seed lead stages first');

  const lead = await leadRepo.create({
    enquiryId: enquiry._id,
    qualificationId: qualification._id,
    currentStageId: initialStage._id,
    temperature: qualification.leadTemperature || enquiry.temperature,
    source: enquiry.source,
    project: enquiry.project,
    propertyType: enquiry.propertyType,
    budget: enquiry.budgetMax || enquiry.budgetMin || 0,
    expectedRevenue: enquiry.budgetMax || 0,
    status: LEAD_STATUS.ACTIVE,
    actualStageAt: new Date(),
    lastActivityAt: new Date(),
    createdBy: actor._id,
  });

  await leadStageHistoryRepo.create({
    leadId: lead._id,
    fromStageId: null,
    toStageId: initialStage._id,
    fromStageName: '',
    toStageName: initialStage.name,
    movedBy: actor._id,
    movedAt: new Date(),
    actualAt: new Date(),
    comment: 'Lead created from qualified enquiry',
  });

  await enquiryRepo.updateStatus(enquiry._id, ENQUIRY_STATUS.CONVERTED, actor._id);

  return leadRepo.findById(lead._id);
};

const list = async (query) => {
  const {
    page = 1,
    limit = 20,
    search,
    status,
    temperature,
    source,
    currentStageId,
    assignedTo,
    from,
    to,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query;

  const filter = {};
  if (status) filter.status = status;
  if (temperature) filter.temperature = temperature;
  if (source) filter.source = source;
  if (currentStageId) filter.currentStageId = currentStageId;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }
  if (search) {
    const regex = { $regex: search, $options: 'i' };
    const enquiryIds = await enquiryRepo.searchIds(search);
    filter.$or = [
      { project: regex },
      { enquiryId: { $in: enquiryIds } },
    ];
  }

  const skip = buildSkip({ page, limit });
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [items, total] = await Promise.all([
    leadRepo.findAll({ filter, sort, skip, limit: Number(limit) }),
    leadRepo.countAll(filter),
  ]);

  return { items, total, page: Number(page), limit: Number(limit) };
};

const getById = async (id) => {
  const lead = await leadRepo.findById(id);
  if (!lead) throw ApiError.notFound('Lead not found');
  return lead;
};

const update = async (id, data, actor) => {
  const lead = await leadRepo.findById(id);
  if (!lead) throw ApiError.notFound('Lead not found');
  if (LEAD_TERMINAL_STATUSES.includes(lead.status)) {
    throw ApiError.badRequest(`Lead is ${lead.status} — cannot update`);
  }

  delete data.enquiryId;
  delete data.currentStageId;
  delete data.assignedTo;
  delete data.status;
  delete data.lostReason;
  delete data.createdBy;

  return leadRepo.update(id, { ...data, updatedBy: actor._id, lastActivityAt: new Date() });
};

const moveStage = (leadId, payload, actor) =>
  workflowEngine.move(leadId, payload.toStageId, {
    comment: payload.comment,
    plannedAt: payload.plannedAt,
    attachments: payload.attachments,
  }, actor);

const undoStage = (leadId, actor) => workflowEngine.undoLast(leadId, actor);

const getHistory = (leadId) => leadStageHistoryRepo.findByLeadId(leadId);

const markWon = async (id, actor) => {
  const lead = await leadRepo.findById(id);
  if (!lead) throw ApiError.notFound('Lead not found');
  if (LEAD_TERMINAL_STATUSES.includes(lead.status)) {
    throw ApiError.badRequest(`Lead is already ${lead.status}`);
  }
  return leadRepo.update(id, {
    status: LEAD_STATUS.WON,
    closedAt: new Date(),
    updatedBy: actor._id,
    lastActivityAt: new Date(),
  });
};

const markLost = async (id, reason, actor) => {
  const lead = await leadRepo.findById(id);
  if (!lead) throw ApiError.notFound('Lead not found');
  if (LEAD_TERMINAL_STATUSES.includes(lead.status)) {
    throw ApiError.badRequest(`Lead is already ${lead.status}`);
  }
  return leadRepo.update(id, {
    status: LEAD_STATUS.LOST,
    lostReason: reason || '',
    closedAt: new Date(),
    updatedBy: actor._id,
    lastActivityAt: new Date(),
  });
};

const markDropped = async (id, reason, actor) => {
  const lead = await leadRepo.findById(id);
  if (!lead) throw ApiError.notFound('Lead not found');
  if (LEAD_TERMINAL_STATUSES.includes(lead.status)) {
    throw ApiError.badRequest(`Lead is already ${lead.status}`);
  }
  return leadRepo.update(id, {
    status: LEAD_STATUS.DROPPED,
    lostReason: reason || '',
    closedAt: new Date(),
    updatedBy: actor._id,
    lastActivityAt: new Date(),
  });
};

const remove = async (id) => {
  const lead = await leadRepo.findById(id);
  if (!lead) throw ApiError.notFound('Lead not found');
  await leadRepo.remove(id);
};

module.exports = {
  createFromEnquiry,
  list,
  getById,
  update,
  moveStage,
  undoStage,
  getHistory,
  markWon,
  markLost,
  markDropped,
  remove,
};
