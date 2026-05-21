const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const config = require('../config');

const normalize = (err) => {
  if (err instanceof ApiError) return err;

  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return ApiError.unprocessable('Validation failed', details);
  }
  if (err instanceof mongoose.Error.CastError) {
    return ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
  }
  if (err && err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return ApiError.conflict(`Duplicate ${field}`);
  }
  if (err && err.name === 'JsonWebTokenError') return ApiError.unauthorized('Invalid token');
  if (err && err.name === 'TokenExpiredError') return ApiError.unauthorized('Token expired');

  return new ApiError(err.statusCode || 500, err.message || 'Internal server error', {
    code: err.code || 'INTERNAL',
    isOperational: false,
  });
};

const errorHandler = (err, req, res, _next) => {
  const apiErr = normalize(err);

  const logMeta = {
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    statusCode: apiErr.statusCode,
    code: apiErr.code,
  };

  if (apiErr.statusCode >= 500) {
    logger.error(apiErr.message, { ...logMeta, stack: apiErr.stack });
  } else {
    logger.warn(apiErr.message, logMeta);
  }

  const payload = {
    success: false,
    message: apiErr.message,
    code: apiErr.code,
  };
  if (apiErr.details) payload.details = apiErr.details;
  if (config.env !== 'production' && apiErr.statusCode >= 500) payload.stack = apiErr.stack;

  res.status(apiErr.statusCode).json(payload);
};

module.exports = errorHandler;
