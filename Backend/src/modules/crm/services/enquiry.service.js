const enquiryRepo = require('../repositories/enquiry.repository');
const reminderService = require('./reminder.service');
const leadService = require('./lead.service');
const ApiError = require('../../../utils/ApiError');
const { buildSkip } = require('../../../utils/pagination');
const { ENQUIRY_STATUS } = require('../../../constants/statuses');
const { REFERENCE_TYPE } = require('../../../constants/referenceTypes');

const followupReminder = (enquiry, actor) => {
  if (!enquiry?.nextFollowupAt) return null;
  const assignedTo =
    (enquiry.assignedTo && (enquiry.assignedTo._id || enquiry.assignedTo)) || actor._id;
  return reminderService.createForFollowup({
    referenceType: REFERENCE_TYPE.ENQUIRY,
    referenceId: enquiry._id,
    assignedTo,
    date: enquiry.nextFollowupAt,
    time: enquiry.followupTime,
    title: `Follow-up: ${enquiry.clientName || 'Enquiry'}`,
    actor,
  });
};

const create = async (data, actor) => {
  if (data.clientPhone && (await enquiryRepo.existsByPhone(data.clientPhone))) {
    // Per #25 + #30: allow when existing is idle OR closed —
    //   (a) idle LEAD (qualified but no activity), OR
    //   (b) idle ENQUIRY (never qualified, no comments), OR
    //   (c) CLOSED previous lead (dropped/lost/won) — show history.
    const [idleLead, idleEnq, closedLead] = await Promise.all([
      leadService.findIdlePreviousLead({
        phone: data.clientPhone,
        email: data.clientEmail,
      }),
      leadService.findIdlePreviousEnquiry({
        phone: data.clientPhone,
        email: data.clientEmail,
      }),
      leadService.findClosedPreviousLead({
        phone: data.clientPhone,
        email: data.clientEmail,
      }),
    ]);
    if (!idleLead && !idleEnq && !closedLead) {
      throw ApiError.conflict('An enquiry with this phone number already exists');
    }
  }
  const created = await enquiryRepo.create({ ...data, createdBy: actor._id });
  const obj = created.toObject();

  // Per #30: link to a closed previous lead so Enquiry Details can show history.
  const closedPrev = await leadService.findClosedPreviousLead({
    phone: obj.clientPhone,
    email: obj.clientEmail,
  });
  if (closedPrev) {
    await enquiryRepo.update(obj._id, { linkedClosedLeadId: closedPrev._id });
    obj.linkedClosedLeadId = closedPrev._id;
  }

  await followupReminder(obj, actor);
  return obj;
};

const list = async (query) => {
  const {
    page = 1,
    limit = 20,
    search,
    status,
    source,
    temperature,
    createdBy,
    from,
    to,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query;

  const filter = {};
  if (status) filter.status = Array.isArray(status) ? { $in: status } : status;
  if (source) filter.source = source;
  if (temperature) filter.temperature = temperature;
  if (createdBy) filter.createdBy = createdBy;
  if (query.assignedQualificationUser) {
    filter.assignedQualificationUser = query.assignedQualificationUser;
  }
  if (query.assignedTo) filter.assignedTo = query.assignedTo;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }
  // Follow-up date filter (nextFollowupAt). followupToday = due today.
  if (query.followupToday || query.activityDate) {
    const day = query.followupToday ? new Date() : new Date(query.activityDate);
    const s = new Date(day);
    s.setHours(0, 0, 0, 0);
    const e = new Date(day);
    e.setHours(23, 59, 59, 999);
    filter.nextFollowupAt = { $gte: s, $lte: e };
  }
  if (search) {
    const regex = { $regex: search, $options: 'i' };
    filter.$or = [
      { clientName: regex },
      { clientPhone: regex },
      { clientEmail: regex },
      { project: regex },
      { remarks: regex },
    ];
  }

  const skip = buildSkip({ page, limit });
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [items, total] = await Promise.all([
    enquiryRepo.findAll({ filter, sort, skip, limit: Number(limit) }),
    enquiryRepo.countAll(filter),
  ]);

  return { items, total, page: Number(page), limit: Number(limit) };
};

const getById = async (id) => {
  const enquiry = await enquiryRepo.findById(id);
  if (!enquiry) throw ApiError.notFound('Enquiry not found');
  return enquiry;
};

const update = async (id, data, actor) => {
  const enquiry = await enquiryRepo.findById(id);
  if (!enquiry) throw ApiError.notFound('Enquiry not found');
  if ([ENQUIRY_STATUS.CONVERTED].includes(enquiry.status)) {
    throw ApiError.badRequest('Cannot edit a converted enquiry');
  }
  if (data.clientPhone && (await enquiryRepo.existsByPhone(data.clientPhone, id))) {
    throw ApiError.conflict('An enquiry with this phone number already exists');
  }
  const updated = await enquiryRepo.update(id, { ...data, updatedBy: actor._id });
  return updated;
};

const setFollowup = async (id, nextFollowupAt, actor) => {
  const updated = await enquiryRepo.update(id, {
    nextFollowupAt: nextFollowupAt ? new Date(nextFollowupAt) : null,
    updatedBy: actor._id,
  });
  if (!updated) throw ApiError.notFound('Enquiry not found');
  await followupReminder(updated, actor);
  return updated;
};

const remove = async (id) => {
  const enquiry = await enquiryRepo.findById(id);
  if (!enquiry) throw ApiError.notFound('Enquiry not found');
  if ([ENQUIRY_STATUS.QUALIFIED, ENQUIRY_STATUS.CONVERTED].includes(enquiry.status)) {
    throw ApiError.badRequest(`Cannot delete an enquiry in status: ${enquiry.status}`);
  }
  await enquiryRepo.remove(id);
};

const bulkImport = async ({ source, rows }, actor) => {
  const skipped = [];
  const seen = new Set();
  const candidates = [];

  rows.forEach((r) => {
    const clientName = (r.clientName || r.name || '').trim();
    const clientPhone = (r.clientPhone || r.phone || '').trim();
    if (!clientName || !clientPhone) {
      skipped.push({ name: clientName, phone: clientPhone, reason: 'Missing name or phone' });
      return;
    }
    if (seen.has(clientPhone)) {
      skipped.push({ name: clientName, phone: clientPhone, reason: 'Duplicate phone in file' });
      return;
    }
    seen.add(clientPhone);
    candidates.push({
      clientName,
      clientPhone,
      clientEmail: (r.clientEmail || r.email || '').trim().toLowerCase(),
      companyName: (r.companyName || '').trim(),
      city: (r.city || '').trim(),
      remarks: (r.remarks || '').trim(),
    });
  });

  const existing = new Set(
    await enquiryRepo.findExistingPhones(candidates.map((c) => c.clientPhone)),
  );

  const toInsert = [];
  candidates.forEach((c) => {
    if (existing.has(c.clientPhone)) {
      skipped.push({ name: c.clientName, phone: c.clientPhone, reason: 'Phone already exists' });
    } else {
      toInsert.push({
        ...c,
        source,
        status: ENQUIRY_STATUS.NEW,
        dateOfEnquiry: new Date(),
        createdBy: actor._id,
      });
    }
  });

  const created = await enquiryRepo.bulkInsert(toInsert);
  return {
    created,
    skipped,
    summary: {
      received: rows.length,
      created: created.length,
      skipped: skipped.length,
    },
  };
};

const bulkAssign = async ({ assignments }, actor) => {
  const result = await enquiryRepo.bulkAssign(assignments, actor._id);
  return { ...result, total: assignments.length };
};

const phoneExists = (phone, excludeId) => enquiryRepo.existsByPhone(phone, excludeId);

// Returns { exists, idle } — idle:true when existing entry is non-blocking
// (idle lead, idle enquiry, OR closed previous lead). New enquiry is allowed.
const phoneExistsDetailed = async (phone, excludeId) => {
  const exists = await enquiryRepo.existsByPhone(phone, excludeId);
  if (!exists) return { exists: false, idle: false };
  const [idleLead, idleEnq, closedLead] = await Promise.all([
    leadService.findIdlePreviousLead({ phone }),
    leadService.findIdlePreviousEnquiry({ phone }),
    leadService.findClosedPreviousLead({ phone }),
  ]);
  return { exists: true, idle: !!(idleLead || idleEnq || closedLead) };
};

const setStatus = (id, status, actor) => enquiryRepo.updateStatus(id, status, actor._id);

const assertExists = async (id) => {
  const ok = await enquiryRepo.existsById(id);
  if (!ok) throw ApiError.notFound('Enquiry not found');
};

module.exports = {
  create,
  list,
  getById,
  update,
  setFollowup,
  remove,
  setStatus,
  assertExists,
  phoneExists,
  phoneExistsDetailed,
  bulkImport,
  bulkAssign,
};
