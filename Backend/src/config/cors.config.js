const config = require('./index');

const origins = config.cors.origin === '*'
  ? '*'
  : config.cors.origin.split(',').map((o) => o.trim()).filter(Boolean);

module.exports = {
  origin: origins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  exposedHeaders: ['X-Request-Id'],
  maxAge: 86400,
};
