const config = require('./index');

module.exports = {
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests — please try again later',
    code: 'TOO_MANY_REQUESTS',
    data: null,
  },
};
