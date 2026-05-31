const User = require('../models/user.model');

const create = (data) => User.create(data);

const findById = (id) =>
  User.findById(id)
    .populate({ path: 'roleId', select: 'name permissions commentMaxStageOrder' })
    .populate({ path: 'additionalRoleIds', select: 'name permissions commentMaxStageOrder' })
    .lean();

const findActiveByIdWithRole = (id) =>
  User.findOne({ _id: id, status: 'active' })
    .populate({ path: 'roleId', select: 'name permissions commentMaxStageOrder' })
    .populate({ path: 'additionalRoleIds', select: 'name permissions commentMaxStageOrder' })
    .lean();

const findByEmail = (email) =>
  User.findOne({ email }).select('+passwordHash').populate({ path: 'roleId', select: 'name permissions commentMaxStageOrder' });

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
    .populate({ path: 'roleId', select: 'name permissions commentMaxStageOrder' })
    .populate({ path: 'additionalRoleIds', select: 'name permissions commentMaxStageOrder' })
    .lean();

const updateRaw = (id, ops) =>
  User.findByIdAndUpdate(id, ops, { new: true });

const remove = (id) => User.findByIdAndDelete(id);

const pushLoginHistory = (id, entry) => {
  const event = entry.event || 'login';
  const update = {
    $push: { loginHistory: { $each: [{ ...entry, event }], $slice: -50 } },
  };
  if (event === 'login') update.$set = { lastLoginAt: entry.at || new Date() };
  return User.findByIdAndUpdate(id, update);
};

const lockUser = (id, reason) =>
  User.findByIdAndUpdate(
    id,
    { $set: { isLocked: true, lockReason: reason || '', lockedAt: new Date() } },
    { new: true },
  );

const unlockUser = (id, actorId) =>
  User.findByIdAndUpdate(
    id,
    {
      $set: {
        isLocked: false,
        lockReason: '',
        lockedAt: null,
        unlockedBy: actorId,
        unlockedAt: new Date(),
        lastLoginAt: null, // reset so next 48h check is exempt
      },
    },
    { new: true },
  );

const getLoginHistory = (id) =>
  User.findById(id).select('loginHistory lastLoginAt isLocked lockReason lockedAt unlockedAt').lean();

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
  lockUser,
  unlockUser,
  getLoginHistory,
};
