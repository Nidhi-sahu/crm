require('dotenv').config();
const { validate } = require('./env');

const env = validate();

module.exports = {
  env: env.NODE_ENV,
  port: env.PORT,
  apiPrefix: env.API_PREFIX,

  db: {
    uri: env.MONGODB_URI,
  },

  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },

  cors: {
    origin: env.CORS_ORIGIN,
  },

  cookie: {
    secret: env.COOKIE_SECRET,
  },

  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
  },

  log: {
    level: env.LOG_LEVEL,
  },

  cron: {
    enabled: env.CRON_ENABLED,
    autoAssignExpression: env.AUTO_ASSIGN_CRON,
    autoAssignDelayMinutes: env.AUTO_ASSIGN_DELAY_MINUTES,
    autoAssignTargetRole: env.AUTO_ASSIGN_TARGET_ROLE,
    autoAssignBatchSize: env.AUTO_ASSIGN_BATCH_SIZE,
    overdueReminderExpression: env.OVERDUE_REMINDER_CRON,
  },
};
