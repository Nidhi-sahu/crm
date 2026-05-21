const Joi = require('joi');
const { objectId, idParam, pagination } = require('../../../validators/common.validator');
const { REFERENCE_TYPE_VALUES } = require('../../../constants/referenceTypes');

const create = {
  body: Joi.object({
    referenceType: Joi.string().valid(...REFERENCE_TYPE_VALUES).required(),
    referenceId: objectId.required(),
    comment: Joi.string().trim().min(1).max(5000).required(),
    nextFollowupDate: Joi.date().iso().optional().allow(null),
    nextFollowupTime: Joi.string().pattern(/^\d{2}:\d{2}$/).optional().allow(''),
  }),
};

const list = {
  query: pagination.keys({
    referenceType: Joi.string().valid(...REFERENCE_TYPE_VALUES).optional(),
    referenceId: objectId.optional(),
    createdBy: objectId.optional(),
    from: Joi.date().iso().optional(),
    to: Joi.date().iso().min(Joi.ref('from')).optional(),
  }),
};

const byRef = {
  params: Joi.object({
    referenceType: Joi.string().valid(...REFERENCE_TYPE_VALUES).required(),
    referenceId: objectId.required(),
  }),
};

const byId = { params: idParam };

module.exports = { create, list, byRef, byId };
