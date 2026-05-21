const ApiError = require('../utils/ApiError');

const SOURCES = ['body', 'params', 'query'];

const validate = (schemas = {}) => (req, _res, next) => {
  const errors = [];
  for (const src of SOURCES) {
    if (!schemas[src]) continue;
    const { value, error } = schemas[src].validate(req[src], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });
    if (error) {
      errors.push(...error.details.map((d) => ({
        source: src,
        field: d.path.join('.') || '_root',
        message: d.message,
      })));
    } else {
      req[src] = value;
    }
  }
  if (errors.length) return next(ApiError.unprocessable('Validation failed', errors));
  next();
};

module.exports = validate;
