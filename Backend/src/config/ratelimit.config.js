const config = require('./index');

module.exports = {
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  // Never throttle the public WhatsApp webhook — Meta requires a 200 response;
  // a 429 makes Meta retry and eventually disable the subscription.
  skip: (req) => req.path.endsWith('/whatsapp/webhook'),
  message: {
    success: false,
    message: 'Too many requests — please try again later',
    code: 'TOO_MANY_REQUESTS',
    data: null,
  },
};
