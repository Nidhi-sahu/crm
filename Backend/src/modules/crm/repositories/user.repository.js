const User = require('../models/user.model');

const create = (data) => User.create(data);

const findById = (id) =>
  User.findById(id)
    .populate({ path: 'roleId', select: 'name permissions' })
    .populate({ path: 'additionalRoleIds', select: 'name permissions' })
    .lean();

const findActiveByIdWithRole = (id) =>
  User.findOne({ _id: id, status: 'active' })
    .populate({ path: 'roleId', select: 'name permissions' })
    .populate({ path: 'additionalRoleIds', select: 'name permissions' })
    .lean();

const findByEmail = (email) =>
  User.findOne({ email }).select('+passwordHash').populate({ path: 'roleId', select: 'name permissions' });

const findByEmailLean = (email) => User.findOne({ email }).lean();

const findByIdWithPassword = (id) => User.findById(id).select('+passwordHash');

const findByResetToken = (hashedToken) =>
  User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpires +passwordHash');

const findActiveByRoleId = (roleId) =>
  User.find({ roleId, status: 'active' })
    .populate({ path: 'roleId', select: 'name' })
    .lean();

const findAll = ({ filter = {}, sort = { createdAt: -1 }, skip = 0, limit = 20 }) =>
  User.find(filter)
    .populate({ path: 'roleId', select: 'name' })
    .populate({ path: 'additionalRoleIds', select: 'name' })
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

const countAll = (filter = {}) => User.countDocuments(filter);

const update = (id, data) =>
  User.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate({ path: 'roleId', select: 'name permissions' })
    .populate({ path: 'additionalRoleIds', select: 'name permissions' })
    .lean();

const updateRaw = (id, ops) =>
  User.findByIdAndUpdate(id, ops, { new: true });

const remove = (id) => User.findByIdAndDelete(id);

const pushLoginHistory = (id, entry) =>
  User.findByIdAndUpdate(id, {
    $set: { lastLoginAt: entry.at || new Date() },
    $push: { loginHistory: { $each: [entry], $slice: -50 } },
  });

module.exports = {
  create,
  findById,
  findActiveByIdWithRole,
  findActiveByRoleId,
  findByEmail,
  findByEmailLean,
  findByIdWithPassword,
  findByResetToken,
  findAll,
  countAll,
  update,
  updateRaw,
  remove,
  pushLoginHistory,
};
