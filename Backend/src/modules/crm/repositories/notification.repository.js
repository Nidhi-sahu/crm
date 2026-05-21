const Notification = require('../models/notification.model');

const create = (data) => Notification.create(data);
const createMany = (items) => Notification.insertMany(items, { ordered: false });

const findById = (id) => Notification.findById(id).lean();

const findForUser = ({ userId, filter = {}, sort = { createdAt: -1 }, skip = 0, limit = 20 }) =>
  Notification.find({ userId, ...filter }).sort(sort).skip(skip).limit(limit).lean();

const countForUser = (userId, filter = {}) =>
  Notification.countDocuments({ userId, ...filter });

const countUnread = (userId) =>
  Notification.countDocuments({ userId, isRead: false });

const markRead = (id, userId) =>
  Notification.findOneAndUpdate(
    { _id: id, userId },
    { $set: { isRead: true, readAt: new Date() } },
    { new: true }
  ).lean();

const markAllReadForUser = (userId) =>
  Notification.updateMany(
    { userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );

const remove = (id, userId) =>
  Notification.findOneAndDelete({ _id: id, userId });

module.exports = {
  create,
  createMany,
  findById,
  findForUser,
  countForUser,
  countUnread,
  markRead,
  markAllReadForUser,
  remove,
};
