const morgan = require('morgan');
const { v4: uuid } = require('uuid');
const logger = require('../utils/logger');
const config = require('../config');

morgan.token('id', (req) => req.id);

const format = config.env === 'production'
  ? ':id :remote-addr :method :url :status :response-time ms'
  : ':id :method :url :status :response-time ms';

const httpLogger = morgan(format, {
  stream: { write: (msg) => logger.info(msg.trim()) },
});

const requestLogger = (req, res, next) => {
  req.id = req.headers['x-request-id'] || uuid();
  res.setHeader('X-Request-Id', req.id);
  return httpLogger(req, res, next);
};

module.exports = requestLogger;
