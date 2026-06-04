const leadRepo = require('../repositories/lead.repository');
const enquiryRepo = require('../repositories/enquiry.repository');
const qualificationRepo = require('../repositories/qualification.repository');
const leadStageRepo = require('../repositories/leadStage.repository');
const leadStageHistoryRepo = require('../repositories/leadStageHistory.repository');
const reminderRepo = require('../repositories/reminder.repository');
const visitReportRepo = require('../repositories/visitReport.repository');
const commentRepo = require('../repositories/comment.repository');
const workflowEngine = require('./workflow.engine');
const ApiError = require('../../../utils/ApiError');
const { buildSkip } = require('../../../utils/pagination');
const ROLES = require('../../../constants/roles');
const {
  ENQUIRY_STATUS,
  QUALIFICATION_STATUS,
  LEAD_STATUS,
  LEAD_TERMINAL_STATUSES,
} = require('../../../constants/statuses');

// Find an idle PREVIOUS ENQUIRY (no lead derived from it, no comments,
// status still NEW). Used when an enquiry was added by another user but
// never qualified — same client should still be allowed to be added.
const findIdlePreviousEnquiry = async ({ phone, email, excludeEnquiryId }) => {
  const phoneTrim = (phone || '').trim();
  const emailTrim = (email || '').trim().toLowerCase();
  if (!phoneTrim && !emailTrim) return null;

  const filter = { $or: [] };
  if (phoneTrim) filter.$or.push({ clientPhone: phoneTrim });
  if (emailTrim) filter.$or.push({ clientEmail: emailTrim });

  const matchingIds = await enquiryRepo.findIdsByMatch(filter);
  if (!matchingIds.length) return null;

  for (const enqId of matchingIds) {
    if (excludeEnquiryId && String(enqId) === String(excludeEnquiryId)) continue;
    const lead = await leadRepo.findByEnquiryId(enqId);
    if (lead) continue; // lead exists — handled by findIdlePreviousLead
    const enquiry = await enquiryRepo.findById(enqId);
    if (!enquiry) continue;
    if (enquiry.status && enquiry.status !== 'new') continue;
    const commentCount = await commentRepo.countAll({
      referenceType: 'enquiry',
      referenceId: enquiry._id,
    });
    if (commentCount === 0) return enquiry;
  }
  return null;
};

// Per #30: find a CLOSED previous lead for the same client (most recent first).
// "Closed" = any non-active terminal status (dropped, lost, won, etc.).
const findClosedPreviousLead = async ({ phone, email, excludeLeadId }) => {
  const phoneTrim = (phone || '').trim();
  const emailTrim = (email || '').trim().toLowerCase();
  if (!phoneTrim && !emailTrim) return null;

  const enqFilter = { $or: [] };
  if (phoneTrim) enqFilter.$or.push({ clientPhone: phoneTrim });
  if (emailTrim) enqFilter.$or.push({ clientEmail: emailTrim });

  const matchingEnquiries = await enquiryRepo.findIdsByMatch(enqFilter);
  if (!matchingEnquiries.length) return null;

  const candidates = await leadRepo.findClosedByEnquiryIds(matchingEnquiries);
  for (const lead of candidates) {
    if (excludeLeadId && String(lead._id) === String(excludeLeadId)) continue;
    return lead;
  }
  return null;
};

// Find an existing IDLE lead for the same client (by phone or email) — used
// to flag "previously associated with another sales person" when the same
// client is added again. "Idle" = no comments, no visit reports, only the
// initial stage-history entry.
const findIdlePreviousLead = async ({ phone, email, excludeLeadId }) => {
  const phoneTrim = (phone || '').trim();
  const emailTrim = (email || '').trim().toLowerCase();
  if (!phoneTrim && !emailTrim) return null;

  const enquiryFilter = { $or: [] };
  if (phoneTrim) enquiryFilter.$or.push({ clientPhone: phoneTrim });
  if (emailTrim) enquiryFilter.$or.push({ clientEmail: emailTrim });
  const matchingEnquiries = await enquiryRepo.findIdsByMatch(enquiryFilter);
  if (!matchingEnquiries.length) return null;

  const candidates = await leadRepo.findActiveByEnquiryIds(matchingEnquiries);
  for (const lead of candidates) {
    if (excludeLeadId && String(lead._id) === String(excludeLeadId)) continue;
    const [commentCount, visitCount, historyCount] = await Promise.all([
      commentRepo.countAll({ referenceType: 'lead', referenceId: lead._id }),
      visitReportRepo.countByLeadId(lead._id),
      leadStageHistoryRepo.countByLeadId(lead._id),
    ]);
    if (commentCount === 0 && visitCount === 0 && historyCount <= 1) {
      return lead;
    }
  }
  return null;
};

// Find ANY active lead for the same client (by phone or email). Used to BLOCK
// re-entry of a number that is already an active lead under a sales person —
// once that lead is dropped/closed it is no longer active and re-entry is allowed.
const findActivePreviousLead = async ({ phone, email, excludeLeadId }) => {
  const phoneTrim = (phone || '').trim();
  const emailTrim = (email || '').trim().toLowerCase();
  if (!phoneTrim && !emailTrim) return null;

  const enquiryFilter = { $or: [] };
  if (phoneTrim) enquiryFilter.$or.push({ clientPhone: phoneTrim });
  if (emailTrim) enquiryFilter.$or.push({ clientEmail: emailTrim });
  const matchingEnquiries = await enquiryRepo.findIdsByMatch(enquiryFilter);
  if (!matchingEnquiries.length) return null;

  const candidates = await leadRepo.findActiveByEnquiryIds(matchingEnquiries);
  for (const lead of candidates) {
    if (excludeLeadId && String(lead._id) === String(excludeLeadId)) continue;
    return lead;
  }
  return null;
};

// Walk-in clients arrive at the site without prior enquiry/qualification.
// Create everything in one call: Enquiry (no phone) + Lead at post-visit stage
// (order 5 — Feedback Call) + StageHistory + VisitReport. Marked isWalkIn=true.
const createWalkIn = async (data, actor) => {
  const stages = await leadStageRepo.findActive();
  const targetStage =
    stages.find((s) => s.order === 5) || stages.find((s) => s.order > 4);
  if (!targetStage) {
    throw ApiError.badRequest('Post-visit stage (order 5) not configured');
  }

  const enquiry = await enquiryRepo.create({
    clientName: data.clientName,
    clientEmail: data.clientEmail || '',
    companyName: data.companyName || '',
    source: 'walkIn',
    project: data.project || '',
    propertyType: data.propertyType || '',
    budgetMax: Number(data.budget) || 0,
    requirement: data.requirement || '',
    status: ENQUIRY_STATUS.QUALIFIED,
    isWalkIn: true,
    createdBy: actor._id,
  });

  const lead = await leadRepo.create({
    enquiryId: enquiry._id,
    qualificationId: null,
    currentStageId: targetStage._id,
    source: 'walkIn',
    project: data.project || '',
    propertyType: data.propertyType || '',
    budget: Number(data.budget) || 0,
    expectedRevenue: Number(data.budget) || 0,
    status: LEAD_STATUS.ACTIVE,
    actualStageAt: new Date(),
    lastActivityAt: new Date(),
    isWalkIn: true,
    createdBy: actor._id,
  });

  await leadStageHistoryRepo.create({
    leadId: lead._id,
    fromStageId: null,
    toStageId: targetStage._id,
    fromStageName: '',
    toStageName: targetStage.name,
    movedBy: actor._id,
    movedAt: new Date(),
    actualAt: new Date(),
    comment: 'Walk-in client — visit done, started at post-visit stage',
  });

  await enquiryRepo.updateStatus(enquiry._id, ENQUIRY_STATUS.CONVERTED, actor._id);

  // Detect previous association — idle LEAD or idle ENQUIRY (walk-ins: email only).
  const previousLead = await findIdlePreviousLead({
    phone: '',
    email: enquiry.clientEmail,
    excludeLeadId: lead._id,
  });
  if (previousLead) {
    await leadRepo.update(lead._id, { linkedPreviousLeadId: previousLead._id });
  } else {
    const previousEnq = await findIdlePreviousEnquiry({
      phone: '',
      email: enquiry.clientEmail,
      excludeEnquiryId: enquiry._id,
    });
    if (previousEnq) {
      await leadRepo.update(lead._id, { linkedPreviousEnquiryId: previousEnq._id });
    }
  }
  const closedLead = await findClosedPreviousLead({
    phone: '',
    email: enquiry.clientEmail,
    excludeLeadId: lead._id,
  });
  if (closedLead) {
    await leadRepo.update(lead._id, { linkedClosedLeadId: closedLead._id });
  }

  if (data.visitReport && Object.keys(data.visitReport).length > 0) {
    await visitReportRepo.create({
      leadId: lead._id,
      visitedAt: data.visitReport.visitedAt || data.visitDate || new Date(),
      customerName: data.visitReport.customerName || data.clientName || '',
      contactNumber: data.visitReport.contactNumber || '',
      salesPersonName: data.visitReport.salesPersonName || '',
      visitorName: data.visitReport.visitorName || '',
      projectVisited: data.visitReport.projectVisited || data.project || '',
      propertyInterested: data.visitReport.propertyInterested || '',
      firstPreference: data.visitReport.firstPreference || '',
      secondPreference: data.visitReport.secondPreference || '',
      customerBudget: data.visitReport.customerBudget || '',
      customerProfession: data.visitReport.customerProfession || '',
      customerAddress: data.visitReport.customerAddress || '',
      sourceOfCustomer: data.visitReport.sourceOfCustomer || 'Walk-in',
      seniorPerson: data.visitReport.seniorPerson || '',
      visitNumber: data.visitReport.visitNumber || '1st',
      photoUrl: data.visitReport.photoUrl || '',
      createdBy: actor._id,
    });
  }

  return leadRepo.findById(lead._id);
};

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

  // Detect previous association — idle LEAD, else idle ENQUIRY.
  const previousLead = await findIdlePreviousLead({
    phone: enquiry.clientPhone,
    email: enquiry.clientEmail,
    excludeLeadId: lead._id,
  });
  if (previousLead) {
    await leadRepo.update(lead._id, { linkedPreviousLeadId: previousLead._id });
  } else {
    const previousEnq = await findIdlePreviousEnquiry({
      phone: enquiry.clientPhone,
      email: enquiry.clientEmail,
      excludeEnquiryId: enquiry._id,
    });
    if (previousEnq) {
      await leadRepo.update(lead._id, { linkedPreviousEnquiryId: previousEnq._id });
    }
  }
  const closedLeadFromEnq = await findClosedPreviousLead({
    phone: enquiry.clientPhone,
    email: enquiry.clientEmail,
    excludeLeadId: lead._id,
  });
  if (closedLeadFromEnq) {
    await leadRepo.update(lead._id, { linkedClosedLeadId: closedLeadFromEnq._id });
  }

  return leadRepo.findById(lead._id);
};

const list = async (query, actor) => {
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
  // assignedTo (specific user) takes precedence; otherwise `assigned` boolean
  // splits unassigned (false) vs assigned (true) — used by the Lead Assignment
  // section to show ONLY leads that still need an owner.
  if (assignedTo) filter.assignedTo = assignedTo;
  else if (query.assigned === false) filter.assignedTo = null;
  else if (query.assigned === true) filter.assignedTo = { $ne: null };
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  // Visit Team users only see leads where they're the visit assignee
  const actorRoleName = actor && actor.roleId && actor.roleId.name;
  if (actorRoleName === ROLES.VISIT_TEAM) {
    filter.visitAssignedTo = actor._id;
  }

  // Sales Person sees ONLY leads assigned to them (data isolation).
  if (actorRoleName === ROLES.SALES_PERSON) {
    filter.assignedTo = actor._id;
  }

  // Brokers see ONLY leads referred via them (enquiry.brokerId = broker._id).
  if (actorRoleName === ROLES.BROKER) {
    const brokerEnqIds = await enquiryRepo.findIdsByMatch({ brokerId: actor._id });
    filter.enquiryId = { $in: brokerEnqIds };
  }

  if (search) {
    const regex = { $regex: search, $options: 'i' };
    const enquiryIds = await enquiryRepo.searchIds(search);
    filter.$or = [
      { project: regex },
      { enquiryId: { $in: enquiryIds } },
    ];
  }

  // Date-based filter: leads whose follow-up / planned date / visit / activity
  // falls on a given day. followupToday = follow-ups (planned date or reminder) due today.
  if (query.followupToday || query.activityDate) {
    const day = query.followupToday ? new Date() : new Date(query.activityDate);
    const start = new Date(day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(day);
    end.setHours(23, 59, 59, 999);
    const inRange = { $gte: start, $lte: end };

    const reminderIds = await reminderRepo.findLeadIdsBetween(start, end);
    const dateOr = [{ plannedStageAt: inRange }];
    if (reminderIds.length) dateOr.push({ _id: { $in: reminderIds } });

    if (query.activityDate) {
      const [visitIds, commentIds] = await Promise.all([
        visitReportRepo.findLeadIdsBetween(start, end),
        commentRepo.findLeadIdsBetween(start, end),
      ]);
      dateOr.push({ actualStageAt: inRange });
      const extra = [...new Set([...visitIds, ...commentIds])];
      if (extra.length) dateOr.push({ _id: { $in: extra } });
    }

    // Combine with an existing $or (from search) without clobbering it.
    if (filter.$or) {
      filter.$and = [{ $or: filter.$or }, { $or: dateOr }];
      delete filter.$or;
    } else {
      filter.$or = dateOr;
    }
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

const moveBackFromVisit = (leadId, body, actor) =>
  workflowEngine.moveBackFromVisit(leadId, body, actor);

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
  createWalkIn,
  findIdlePreviousLead,
  findIdlePreviousEnquiry,
  findClosedPreviousLead,
  findActivePreviousLead,
  list,
  getById,
  update,
  moveStage,
  undoStage,
  moveBackFromVisit,
  getHistory,
  markWon,
  markLost,
  markDropped,
  remove,
};
