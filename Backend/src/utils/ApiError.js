class ApiError extends Error {
  constructor(statusCode, message, { code = null, details = null, isOperational = true } = {}) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;
    if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad request', details = null) {
    return new ApiError(400, message, { code: 'BAD_REQUEST', details });
  }
  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message, { code: 'UNAUTHORIZED' });
  }
  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message, { code: 'FORBIDDEN' });
  }
  static notFound(message = 'Not found') {
    return new ApiError(404, message, { code: 'NOT_FOUND' });
  }
  static conflict(message = 'Conflict') {
    return new ApiError(409, message, { code: 'CONFLICT' });
  }
  static unprocessable(message = 'Unprocessable entity', details = null) {
    return new ApiError(422, message, { code: 'UNPROCESSABLE', details });
  }
  static tooMany(message = 'Too many requests') {
    return new ApiError(429, message, { code: 'TOO_MANY_REQUESTS' });
  }
  static internal(message = 'Internal server error') {
    return new ApiError(500, message, { code: 'INTERNAL', isOperational: false });
  }
}

module.exports = ApiError;
