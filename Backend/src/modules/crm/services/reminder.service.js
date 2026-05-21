const reminderRepo = require('../repositories/reminder.repository');
const enquiryRepo = require('../repositories/enquiry.repository');
const leadRepo = require('../repositories/lead.repository');
const qualificationRepo = require('../repositories/qualification.repository');
const userRepo = require('../repositories/user.repository');
const ApiError = require('../../../utils/ApiError');
const { buildSkip } = require('../../../utils/pagination');
const { REFERENCE_TYPE } = require('../../../constants/referenceTypes');
const { REMINDER_STATUS } = require('../../../constants/statuses');

const assertReferenceExists = async (referenceType, referenceId) => {
  let exists = false;
  if (referenceType === REFERENCE_TYPE.ENQUIRY) {
    exists = await enquiryRepo.existsById(referenceId);
  } else if (referenceType === REFERENCE_TYPE.LEAD) {
    const l = await leadRepo.findById(referenceId);
    exists = !!l;
  } else if (referenceType === REFERENCE_TYPE.QUALIFICATION) {
    const q = await qualificationRepo.findById(referenceId);
    exists = !!q;
  }
  if (!exists) throw ApiError.badRequest(`${referenceType} not found: ${referenceId}`);
};

const combineDateTime = (date, time) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) throw ApiError.badRequest('Invalid reminderDate');
  if (time && /^\d{2}:\d{2}$/.test(time)) {
    const [h, m] = time.split(':').map(Number);
    d.setHours(h, m, 0, 0);
  }
  return d;
};

const create = async (data, actor) => {
  await assertReferenceExists(data.referenceType, data.referenceId);

  const assignee = await userRepo.findById(data.assignedTo);
  if (!assignee) throw ApiError.badRequest('Assignee not found');
  if (assignee.status !== 'active') throw ApiError.badRequest('Assignee is not active');

  const reminderAt = combineDateTime(data.reminderDate, data.reminderTime);

  const created = await reminderRepo.create({
    referenceType: data.referenceType,
    referenceId: data.referenceId,
    assignedTo: data.assignedTo,
    title: data.title,
    description: data.description || '',
    reminderDate: new Date(data.reminderDate),
    reminderTime: data.reminderTime || '',
    reminderAt,
    status: REMINDER_STATUS.PENDING,
    createdBy: actor._id,
  });
  return created.toObject();
};

const list = async (query) => {
  const {
    page = 1,
    limit = 20,
    status,
    assignedTo,
    referenceType,
    referenceId,
    from,
    to,
    sortBy = 'reminderAt',
    sortOrder = 'asc',
  } = query;

  const filter = {};
  if (status) filter.status = status;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (referenceType) filter.referenceType = referenceType;
  if (referenceId) filter.referenceId = referenceId;
  if (from || to) {
    filter.reminderAt = {};
    if (from) filter.reminderAt.$gte = new Date(from);
    if (to) filter.reminderAt.$lte = new Date(to);
  }

  const skip = buildSkip({ page, limit });
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [items, total] = await Promise.all([
    reminderRepo.findAll({ filter, sort, skip, limit: Number(limit) }),
    reminderRepo.countAll(filter),
  ]);
  return { items, total, page: Number(page), limit: Number(limit) };
};

const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const endOfDay = (d) => { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; };

const today = (userId, query = {}) => {
  const now = new Date();
  return list({
    ...query,
    assignedTo: query.assignedTo || userId,
    status: query.status || REMINDER_STATUS.PENDING,
    from: startOfDay(now).toISOString(),
    to: endOfDay(now).toISOString(),
  });
};

const overdue = (userId, query = {}) => {
  return list({
    ...query,
    assignedTo: query.assignedTo || userId,
    status: REMINDER_STATUS.PENDING,
    to: new Date().toISOString(),
  });
};

const missed = (userId, query = {}) =>
  list({ ...query, assignedTo: query.assignedTo || userId, status: REMINDER_STATUS.MISSED });

const getById = async (id) => {
  const r = await reminderRepo.findById(id);
  if (!r) throw ApiError.notFound('Reminder not found');
  return r;
};

const update = async (id, data, actor) => {
  const r = await reminderRepo.findById(id);
  if (!r) throw ApiError.notFound('Reminder not found');
  if (r.status !== REMINDER_STATUS.PENDING) {
    throw ApiError.badRequest(`Cannot edit reminder in status: ${r.status}`);
  }
  const patch = { ...data };
  if (data.reminderDate || data.reminderTime) {
    const date = data.reminderDate || r.reminderDate;
    const time = data.reminderTime !== undefined ? data.reminderTime : r.reminderTime;
    patch.reminderAt = combineDateTime(date, time);
    if (data.reminderDate) patch.reminderDate = new Date(data.reminderDate);
  }
  if (data.assignedTo) {
    const u = await userRepo.findById(data.assignedTo);
    if (!u) throw ApiError.badRequest('Assignee not found');
  }
  patch.updatedBy = actor._id;
  return reminderRepo.update(id, patch);
};

const complete = async (id, actor) => {
  const r = await reminderRepo.findById(id);
  if (!r) throw ApiError.notFound('Reminder not found');
  if (r.status === REMINDER_STATUS.DONE) throw ApiError.badRequest('Already completed');
  return reminderRepo.update(id, {
    status: REMINDER_STATUS.DONE,
    completedAt: new Date(),
    completedBy: actor._id,
  });
};

const cancel = async (id) => {
  const r = await reminderRepo.findById(id);
  if (!r) throw ApiError.notFound('Reminder not found');
  if (r.status !== REMINDER_STATUS.PENDING) {
    throw ApiError.badRequest(`Cannot cancel reminder in status: ${r.status}`);
  }
  return reminderRepo.update(id, { status: REMINDER_STATUS.CANCELLED });
};

const remove = async (id) => {
  const r = await reminderRepo.findById(id);
  if (!r) throw ApiError.notFound('Reminder not found');
  await reminderRepo.remove(id);
};

module.exports = {
  create,
  list,
  today,
  overdue,
  missed,
  getById,
  update,
  complete,
  cancel,
  remove,
};
