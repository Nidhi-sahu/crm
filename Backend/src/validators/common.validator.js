const Joi = require('joi');

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).message('Must be a valid ObjectId');

const email = Joi.string().email({ tlds: { allow: false }, minDomainSegments: 2 });

const idParam = Joi.object({ id: objectId.required() });

const pagination = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().allow('').optional(),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

const dateRange = Joi.object({
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().min(Joi.ref('from')).optional(),
});

module.exports = { objectId, email, idParam, pagination, dateRange };
