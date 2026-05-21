const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyAccess } = require('../utils/jwt.util');
const userRepository = require('../modules/crm/repositories/user.repository');

const auth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(ApiError.unauthorized('Missing or malformed Authorization header'));
  }

  let payload;
  try {
    payload = verifyAccess(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') return next(ApiError.unauthorized('Token expired'));
    return next(ApiError.unauthorized('Invalid token'));
  }

  const user = await userRepository.findActiveByIdWithRole(payload.sub);
  if (!user) return next(ApiError.unauthorized('User not found or inactive'));

  const rolePerms = (user.roleId && user.roleId.permissions) || [];
  const addlRolePerms = (user.additionalRoleIds || []).flatMap(
    (r) => (r && r.permissions) || [],
  );
  const extraPerms = user.additionalPermissions || [];
  user.permissionSet = new Set([...rolePerms, ...addlRolePerms, ...extraPerms]);

  req.user = user;
  req.auth = { userId: String(user._id), tokenPayload: payload };
  next();
});

module.exports = auth;
