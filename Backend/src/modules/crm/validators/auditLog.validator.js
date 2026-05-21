const Joi = require('joi');
const { objectId, idParam, pagination } = require('../../../validators/common.validator');

const list = {
  query: pagination.keys({
    module: Joi.string().trim().max(50).optional(),
    action: Joi.string().trim().max(50).optional(),
    performedBy: objectId.optional(),
    refType: Joi.string().trim().max(50).optional(),
    refId: objectId.optional(),
    success: Joi.boolean().optional(),
    from: Joi.date().iso().optional(),
    to: Joi.date().iso().min(Joi.ref('from')).optional(),
  }),
};

const byId = { params: idParam };

module.exports = { list, byId };
