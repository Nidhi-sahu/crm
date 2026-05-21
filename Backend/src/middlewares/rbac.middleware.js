const ApiError = require('../utils/ApiError');

const rbac = (required, mode = 'any') => (req, _res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  const needed = Array.isArray(required) ? required : [required];
  const have = req.user.permissionSet || new Set();
  const ok = mode === 'all'
    ? needed.every((p) => have.has(p))
    : needed.some((p) => have.has(p));
  if (!ok) return next(ApiError.forbidden(`Missing permission(s): ${needed.join(', ')}`));
  next();
};

module.exports = rbac;
