const RefreshToken = require('../models/refreshToken.model');

const create = (data) => RefreshToken.create(data);

const findActiveByJti = (jti) =>
  RefreshToken.findOne({ jti, revokedAt: null });

const revokeByJti = (jti) =>
  RefreshToken.findOneAndUpdate({ jti, revokedAt: null }, { $set: { revokedAt: new Date() } });

const revokeAllForUser = (userId) =>
  RefreshToken.updateMany({ userId, revokedAt: null }, { $set: { revokedAt: new Date() } });

const deleteExpired = () =>
  RefreshToken.deleteMany({ expiresAt: { $lt: new Date() } });

module.exports = {
  create,
  findActiveByJti,
  revokeByJti,
  revokeAllForUser,
  deleteExpired,
};
