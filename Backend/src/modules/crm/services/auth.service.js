const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');

const userRepo = require('../repositories/user.repository');
const refreshTokenRepo = require('../repositories/refreshToken.repository');
const hashUtil = require('../../../utils/hash.util');
const { signAccess, signRefresh, verifyRefresh, newJti, parseExpiry } = require('../../../utils/jwt.util');
const jwtConfig = require('../../../config/jwt.config');
const config = require('../../../config');
const ApiError = require('../../../utils/ApiError');

const googleClient = new OAuth2Client(config.google.clientId);

const buildTokenPair = async (user, deviceInfo) => {
  const jti = newJti();
  const accessToken = signAccess({
    sub: String(user._id),
    email: user.email,
    role: user.roleId && (user.roleId._id ? String(user.roleId._id) : String(user.roleId)),
  });
  const refreshToken = signRefresh({ sub: String(user._id) }, jti);
  const expiresAt = new Date(Date.now() + parseExpiry(jwtConfig.refresh.expiresIn));
  await refreshTokenRepo.create({ userId: user._id, jti, deviceInfo, expiresAt });
  return { accessToken, refreshToken, expiresAt };
};

const sanitizeUser = (userDoc) => {
  const obj = typeof userDoc.toJSON === 'function' ? userDoc.toJSON() : { ...userDoc };
  delete obj.passwordHash;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

const login = async ({ email, password, deviceInfo }) => {
  const user = await userRepo.findByEmail(email);
  if (!user) throw ApiError.unauthorized('Invalid credentials');
  if (user.status !== 'active') throw ApiError.forbidden('Account inactive');

  const ok = await hashUtil.compare(password, user.passwordHash);
  if (!ok) throw ApiError.unauthorized('Invalid credentials');

  const tokens = await buildTokenPair(user, deviceInfo);
  await userRepo.pushLoginHistory(user._id, {
    at: new Date(),
    ip: deviceInfo && deviceInfo.ip,
    userAgent: deviceInfo && deviceInfo.userAgent,
  });

  return { user: sanitizeUser(user), ...tokens };
};

const loginWithGoogle = async ({ credential, deviceInfo }) => {
  if (!config.google.clientId) {
    throw ApiError.badRequest('Google login is not configured');
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: config.google.clientId,
    });
    payload = ticket.getPayload();
  } catch {
    throw ApiError.unauthorized('Invalid Google token');
  }

  if (!payload || !payload.email) throw ApiError.unauthorized('Invalid Google token');
  if (!payload.email_verified) throw ApiError.unauthorized('Google email not verified');

  const user = await userRepo.findByEmail(payload.email.toLowerCase());
  if (!user) {
    throw ApiError.unauthorized('This Google account is not registered. Contact your administrator.');
  }
  if (user.status !== 'active') throw ApiError.forbidden('Account inactive');

  const tokens = await buildTokenPair(user, deviceInfo);
  await userRepo.pushLoginHistory(user._id, {
    at: new Date(),
    ip: deviceInfo && deviceInfo.ip,
    userAgent: deviceInfo && deviceInfo.userAgent,
  });

  return { user: sanitizeUser(user), ...tokens };
};

const refresh = async ({ refreshToken, deviceInfo }) => {
  if (!refreshToken) throw ApiError.unauthorized('Refresh token missing');

  let payload;
  try {
    payload = verifyRefresh(refreshToken);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const stored = await refreshTokenRepo.findActiveByJti(payload.jti);
  if (!stored) throw ApiError.unauthorized('Refresh token revoked or unknown');

  await refreshTokenRepo.revokeByJti(payload.jti);

  const user = await userRepo.findActiveByIdWithRole(payload.sub);
  if (!user) throw ApiError.unauthorized('User not found or inactive');

  return buildTokenPair(user, deviceInfo);
};

const logout = async ({ refreshToken }) => {
  if (!refreshToken) return;
  try {
    const payload = verifyRefresh(refreshToken);
    await refreshTokenRepo.revokeByJti(payload.jti);
  } catch {
    /* idempotent — invalid token = already effectively logged out */
  }
};

const logoutAll = ({ userId }) => refreshTokenRepo.revokeAllForUser(userId);

const forgotPassword = async ({ email }) => {
  const user = await userRepo.findByEmailLean(email);
  if (!user) return { token: null };

  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expires = new Date(Date.now() + 30 * 60 * 1000);

  await userRepo.updateRaw(user._id, {
    $set: { passwordResetToken: hashed, passwordResetExpires: expires },
  });

  return { token: rawToken };
};

const resetPassword = async ({ token, newPassword }) => {
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const user = await userRepo.findByResetToken(hashed);
  if (!user) throw ApiError.badRequest('Invalid or expired reset token');

  user.passwordHash = await hashUtil.hash(newPassword);
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  await user.save();

  await refreshTokenRepo.revokeAllForUser(user._id);
};

const changePassword = async ({ userId, currentPassword, newPassword }) => {
  const user = await userRepo.findByIdWithPassword(userId);
  if (!user) throw ApiError.notFound('User not found');

  const ok = await hashUtil.compare(currentPassword, user.passwordHash);
  if (!ok) throw ApiError.badRequest('Current password incorrect');

  user.passwordHash = await hashUtil.hash(newPassword);
  await user.save();

  await refreshTokenRepo.revokeAllForUser(userId);
};

module.exports = {
  login,
  loginWithGoogle,
  refresh,
  logout,
  logoutAll,
  forgotPassword,
  resetPassword,
  changePassword,
};
