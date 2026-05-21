const Joi = require('joi');
const { objectId } = require('../../../validators/common.validator');
const { SOURCE_VALUES } = require('../../../constants/sources');

const filters = Joi.object({
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().min(Joi.ref('from')).optional(),
  salespersonId: objectId.optional(),
  source: Joi.string().valid(...SOURCE_VALUES).optional(),
  project: Joi.string().trim().max(100).optional(),
});

const list = { query: filters };

module.exports = { filters, list };
