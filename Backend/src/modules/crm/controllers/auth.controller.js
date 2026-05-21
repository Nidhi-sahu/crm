const asyncHandler = require('../../../utils/asyncHandler');
const ApiResponse = require('../../../utils/ApiResponse');
const authService = require('../services/auth.service');
const auditLogService = require('../services/auditLog.service');
const config = require('../../../config');

const COOKIE_NAME = 'refresh_token';

const cookieOptions = {
  httpOnly: true,
  secure: config.env === 'production',
  sameSite: 'lax',
  signed: true,
  path: '/',
};

const getDeviceInfo = (req) => ({
  userAgent: req.headers['user-agent'] || '',
  ip: req.ip || '',
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const deviceInfo = getDeviceInfo(req);
  try {
    const { user, accessToken, refreshToken, expiresAt } = await authService.login({ email, password, deviceInfo });
    res.cookie(COOKIE_NAME, refreshToken, { ...cookieOptions, expires: expiresAt });
    auditLogService.log({
      module: 'auth',
      action: 'login',
      actor: user,
      refType: 'user',
      refId: user._id,
      ipAddress: deviceInfo.ip,
      userAgent: deviceInfo.userAgent,
      success: true,
      meta: { email },
    });
    ApiResponse.ok(res, { user, accessToken, refreshToken }, 'Login successful');
  } catch (err) {
    auditLogService.log({
      module: 'auth',
      action: 'login',
      ipAddress: deviceInfo.ip,
      userAgent: deviceInfo.userAgent,
      success: false,
      errorMessage: err && err.message,
      meta: { email },
    });
    throw err;
  }
});

const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.signedCookies[COOKIE_NAME] || req.body.refreshToken;
  const tokens = await authService.refresh({
    refreshToken,
    deviceInfo: getDeviceInfo(req),
  });
  res.cookie(COOKIE_NAME, tokens.refreshToken, { ...cookieOptions, expires: tokens.expiresAt });
  ApiResponse.ok(res, {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  }, 'Token refreshed');
});

const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.signedCookies[COOKIE_NAME] || req.body.refreshToken;
  await authService.logout({ refreshToken });
  res.clearCookie(COOKIE_NAME, cookieOptions);
  if (req.user) {
    auditLogService.log({
      module: 'auth',
      action: 'logout',
      actor: req.user,
      refType: 'user',
      refId: req.user._id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
    });
  }
  ApiResponse.ok(res, null, 'Logged out');
});

const logoutAll = asyncHandler(async (req, res) => {
  await authService.logoutAll({ userId: req.user._id });
  res.clearCookie(COOKIE_NAME, cookieOptions);
  auditLogService.log({
    module: 'auth',
    action: 'logoutAll',
    actor: req.user,
    refType: 'user',
    refId: req.user._id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] || '',
  });
  ApiResponse.ok(res, null, 'Logged out from all devices');
});

const me = asyncHandler(async (req, res) => {
  const { permissionSet, ...user } = req.user;
  ApiResponse.ok(res, {
    user,
    permissions: Array.from(permissionSet || []),
  }, 'Current user');
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await authService.forgotPassword({ email });
  const payload = config.env === 'production' ? null : { resetToken: result.token };
  ApiResponse.ok(res, payload, 'If the email exists, a reset link has been sent');
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  await authService.resetPassword({ token, newPassword: password });
  ApiResponse.ok(res, null, 'Password reset successful');
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword({
    userId: req.user._id,
    currentPassword,
    newPassword,
  });
  ApiResponse.ok(res, null, 'Password changed');
});

module.exports = {
  login,
  refresh,
  logout,
  logoutAll,
  me,
  forgotPassword,
  resetPassword,
  changePassword,
};
