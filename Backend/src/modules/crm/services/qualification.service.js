const qualificationRepo = require('../repositories/qualification.repository');
const enquiryRepo = require('../repositories/enquiry.repository');
const ApiError = require('../../../utils/ApiError');
const { buildSkip } = require('../../../utils/pagination');
const { classifyByScore } = require('../../../constants/temperatures');
const {
  ENQUIRY_STATUS,
  QUALIFICATION_STATUS,
} = require('../../../constants/statuses');

const ALLOWED_ENQUIRY_STATUSES_FOR_QUALIFY = [
  ENQUIRY_STATUS.NEW,
  ENQUIRY_STATUS.CONTACTED,
  ENQUIRY_STATUS.HOLD,
];

const create = async (data, actor) => {
  const enquiry = await enquiryRepo.findById(data.enquiryId);
  if (!enquiry) throw ApiError.notFound('Enquiry not found');

  const existing = await qualificationRepo.findByEnquiryId(data.enquiryId);
  if (existing) throw ApiError.conflict('Qualification already exists for this enquiry');

  if (![ENQUIRY_STATUS.NEW, ENQUIRY_STATUS.CONTACTED, ENQUIRY_STATUS.HOLD].includes(enquiry.status)) {
    throw ApiError.badRequest(`Enquiry in status '${enquiry.status}' cannot be qualified`);
  }

  const score = typeof data.score === 'number' ? data.score : 0;
  const leadTemperature = data.leadTemperature || classifyByScore(score);

  const created = await qualificationRepo.create({
    enquiryId: data.enquiryId,
    answers: data.answers || [],
    score,
    leadTemperature,
    remarks: data.remarks || '',
    nextFollowupAt: data.nextFollowupAt ? new Date(data.nextFollowupAt) : null,
    qualificationStatus: QUALIFICATION_STATUS.PENDING,
    createdBy: actor._id,
  });

  await enquiryRepo.updateStatus(data.enquiryId, ENQUIRY_STATUS.CONTACTED, actor._id);

  return created.toObject();
};

const list = async (query) => {
  const {
    page = 1,
    limit = 20,
    qualificationStatus,
    leadTemperature,
    enquiryId,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query;

  const filter = {};
  if (qualificationStatus) filter.qualificationStatus = qualificationStatus;
  if (leadTemperature) filter.leadTemperature = leadTemperature;
  if (enquiryId) filter.enquiryId = enquiryId;

  const skip = buildSkip({ page, limit });
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [items, total] = await Promise.all([
    qualificationRepo.findAll({ filter, sort, skip, limit: Number(limit) }),
    qualificationRepo.countAll(filter),
  ]);

  return { items, total, page: Number(page), limit: Number(limit) };
};

const getById = async (id) => {
  const q = await qualificationRepo.findById(id);
  if (!q) throw ApiError.notFound('Qualification not found');
  return q;
};

const getByEnquiry = async (enquiryId) => {
  const q = await qualificationRepo.findByEnquiryId(enquiryId);
  if (!q) throw ApiError.notFound('No qualification for this enquiry');
  return q;
};

const update = async (id, data, actor) => {
  const existing = await qualificationRepo.findById(id);
  if (!existing) throw ApiError.notFound('Qualification not found');
  if (existing.qualificationStatus !== QUALIFICATION_STATUS.PENDING) {
    throw ApiError.badRequest(`Cannot edit qualification in status: ${existing.qualificationStatus}`);
  }
  const patch = { ...data, updatedBy: actor._id };
  if (typeof patch.score === 'number' && !patch.leadTemperature) {
    patch.leadTemperature = classifyByScore(patch.score);
  }
  return qualificationRepo.update(id, patch);
};

const qualify = async (id, actor) => {
  const q = await qualificationRepo.findById(id);
  if (!q) throw ApiError.notFound('Qualification not found');
  if (q.qualificationStatus === QUALIFICATION_STATUS.QUALIFIED) {
    throw ApiError.badRequest('Already qualified');
  }
  if (q.qualificationStatus === QUALIFICATION_STATUS.REJECTED) {
    throw ApiError.badRequest('Cannot qualify a rejected enquiry — create a new qualification');
  }

  const updated = await qualificationRepo.update(id, {
    qualificationStatus: QUALIFICATION_STATUS.QUALIFIED,
    qualifiedBy: actor._id,
    qualifiedAt: new Date(),
    updatedBy: actor._id,
  });

  const enquiryId = q.enquiryId && (q.enquiryId._id || q.enquiryId);
  await enquiryRepo.update(enquiryId, {
    status: ENQUIRY_STATUS.QUALIFIED,
    temperature: updated.leadTemperature,
    updatedBy: actor._id,
  });

  return updated;
};

const reject = async (id, reason, actor) => {
  const q = await qualificationRepo.findById(id);
  if (!q) throw ApiError.notFound('Qualification not found');
  if (q.qualificationStatus === QUALIFICATION_STATUS.REJECTED) {
    throw ApiError.badRequest('Already rejected');
  }

  const updated = await qualificationRepo.update(id, {
    qualificationStatus: QUALIFICATION_STATUS.REJECTED,
    rejectionReason: reason || '',
    qualifiedBy: actor._id,
    updatedBy: actor._id,
  });

  const enquiryId = q.enquiryId && (q.enquiryId._id || q.enquiryId);
  await enquiryRepo.updateStatus(enquiryId, ENQUIRY_STATUS.REJECTED, actor._id);

  return updated;
};

const hold = async (id, { holdUntil, remarks }, actor) => {
  const q = await qualificationRepo.findById(id);
  if (!q) throw ApiError.notFound('Qualification not found');

  const updated = await qualificationRepo.update(id, {
    qualificationStatus: QUALIFICATION_STATUS.HOLD,
    holdUntil: holdUntil ? new Date(holdUntil) : null,
    remarks: remarks || q.remarks,
    updatedBy: actor._id,
  });

  const enquiryId = q.enquiryId && (q.enquiryId._id || q.enquiryId);
  await enquiryRepo.updateStatus(enquiryId, ENQUIRY_STATUS.HOLD, actor._id);

  return updated;
};

const futureProspect = async (id, actor) => {
  const q = await qualificationRepo.findById(id);
  if (!q) throw ApiError.notFound('Qualification not found');
  if (q.qualificationStatus === QUALIFICATION_STATUS.FUTURE_PROSPECT) {
    throw ApiError.badRequest('Already marked as future prospect');
  }

  const updated = await qualificationRepo.update(id, {
    qualificationStatus: QUALIFICATION_STATUS.FUTURE_PROSPECT,
    qualifiedBy: actor._id,
    updatedBy: actor._id,
  });

  const enquiryId = q.enquiryId && (q.enquiryId._id || q.enquiryId);
  await enquiryRepo.updateStatus(enquiryId, ENQUIRY_STATUS.HOLD, actor._id);

  return updated;
};

module.exports = {
  create,
  list,
  getById,
  getByEnquiry,
  update,
  qualify,
  reject,
  hold,
  futureProspect,
};
