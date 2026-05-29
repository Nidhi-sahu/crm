const ApiError = require('../utils/ApiError');
const ROLES = require('../constants/roles');

// Allows only Administrator. Use after the `auth` middleware.
module.exports = (req, _res, next) => {
  const roleName = req.user && req.user.roleId && req.user.roleId.name;
  if (roleName === ROLES.ADMINISTRATOR) return next();
  return next(ApiError.forbidden('Admin access required'));
};
