const Reminder = require('../models/reminder.model');
const { REMINDER_STATUS } = require('../../../constants/statuses');

const create = (data) => Reminder.create(data);

const findById = (id) =>
  Reminder.findById(id)
    .populate({ path: 'assignedTo', select: 'name email' })
    .populate({ path: 'createdBy', select: 'name email' })
    .populate({ path: 'completedBy', select: 'name email' })
    .lean();

const findAll = ({ filter = {}, sort = { reminderAt: 1 }, skip = 0, limit = 20 }) =>
  Reminder.find(filter)
    .populate({ path: 'assignedTo', select: 'name email' })
    .populate({ path: 'createdBy', select: 'name email' })
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

const countAll = (filter = {}) => Reminder.countDocuments(filter);

const update = (id, data) =>
  Reminder.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate({ path: 'assignedTo', select: 'name email' })
    .lean();

const remove = (id) => Reminder.findByIdAndDelete(id);

const findOverduePending = (now = new Date(), limit = 100) =>
  Reminder.find({ status: REMINDER_STATUS.PENDING, reminderAt: { $lt: now } })
    .sort({ reminderAt: 1 })
    .limit(limit);

const markMissedBulk = (ids) =>
  Reminder.updateMany(
    { _id: { $in: ids }, status: REMINDER_STATUS.PENDING },
    { $set: { status: REMINDER_STATUS.MISSED } }
  );

// Overdue + pending items not notified since `since` (≈ daily throttle).
const findOverdueToNotify = (now = new Date(), since, limit = 200) =>
  Reminder.find({
    status: REMINDER_STATUS.PENDING,
    reminderAt: { $lt: now },
    $or: [{ overdueNotifiedAt: null }, { overdueNotifiedAt: { $lt: since } }],
  })
    .sort({ reminderAt: 1 })
    .limit(limit);

const markOverdueNotifiedBulk = (ids, at = new Date()) =>
  Reminder.updateMany({ _id: { $in: ids } }, { $set: { overdueNotifiedAt: at } });

// Lead IDs that have a pending follow-up (reminder) due within a date range.
const findLeadIdsBetween = async (start, end) => {
  const docs = await Reminder.find({
    referenceType: 'lead',
    status: REMINDER_STATUS.PENDING,
    reminderAt: { $gte: start, $lte: end },
  })
    .select('referenceId')
    .lean();
  return docs.map((d) => String(d.referenceId));
};

module.exports = {
  create,
  findById,
  findAll,
  countAll,
  update,
  remove,
  findOverduePending,
  markMissedBulk,
  findOverdueToNotify,
  markOverdueNotifiedBulk,
  findLeadIdsBetween,
};
