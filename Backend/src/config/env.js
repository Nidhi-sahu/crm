const Joi = require('joi');

const schema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(5000),
  API_PREFIX: Joi.string().default('/api/v1'),

  MONGODB_URI: Joi.string().required(),

  JWT_ACCESS_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  CORS_ORIGIN: Joi.string().default('*'),
  COOKIE_SECRET: Joi.string().min(16).required(),

  RATE_LIMIT_WINDOW_MS: Joi.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: Joi.number().default(300),

  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),

  CRON_ENABLED: Joi.boolean().default(true),
  AUTO_ASSIGN_CRON: Joi.string().default('0 * * * *'),
  AUTO_ASSIGN_DELAY_MINUTES: Joi.number().integer().min(0).default(1440),
  AUTO_ASSIGN_TARGET_ROLE: Joi.string().default('Sales Person'),
  AUTO_ASSIGN_BATCH_SIZE: Joi.number().integer().min(1).max(500).default(50),

  OVERDUE_REMINDER_CRON: Joi.string().default('*/15 * * * *'),
}).unknown(true);

const validate = () => {
  const { value, error } = schema.validate(process.env, { abortEarly: false, stripUnknown: false });
  if (error) {
    const messages = error.details.map((d) => `  - ${d.message}`).join('\n');
    throw new Error(`Env validation failed:\n${messages}`);
  }
  return value;
};

module.exports = { validate };
