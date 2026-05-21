const config = require('./index');

module.exports = {
  access: {
    secret: config.jwt.accessSecret,
    expiresIn: config.jwt.accessExpiresIn,
  },
  refresh: {
    secret: config.jwt.refreshSecret,
    expiresIn: config.jwt.refreshExpiresIn,
  },
  issuer: 'langdi-crm',
  audience: 'langdi-crm-clients',
};
