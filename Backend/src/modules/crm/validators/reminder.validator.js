const Joi = require('joi');
const { objectId, idParam, pagination } = require('../../../validators/common.validator');
const { REFERENCE_TYPE_VALUES } = require('../../../constants/referenceTypes');
const { REMINDER_STATUS_VALUES } = require('../../../constants/statuses');

const TIME_PATTERN = /^\d{2}:\d{2}$/;

const create = {
  body: Joi.object({
    referenceType: Joi.string().valid(...REFERENCE_TYPE_VALUES).required(),
    referenceId: objectId.required(),
    assignedTo: objectId.required(),
    title: Joi.string().trim().min(2).max(200).required(),
    description: Joi.string().trim().max(2000).optional().allow(''),
    reminderDate: Joi.date().iso().required(),
    reminderTime: Joi.string().pattern(TIME_PATTERN).optional().allow(''),
  }),
};

const update = {
  params: idParam,
  body: Joi.object({
    assignedTo: objectId.optional(),
    title: Joi.string().trim().min(2).max(200).optional(),
    description: Joi.string().trim().max(2000).optional().allow(''),
    reminderDate: Joi.date().iso().optional(),
    reminderTime: Joi.string().pattern(TIME_PATTERN).optional().allow(''),
  }).min(1),
};

const list = {
  query: pagination.keys({
    status: Joi.string().valid(...REMINDER_STATUS_VALUES).optional(),
    assignedTo: objectId.optional(),
    referenceType: Joi.string().valid(...REFERENCE_TYPE_VALUES).optional(),
    referenceId: objectId.optional(),
    from: Joi.date().iso().optional(),
    to: Joi.date().iso().min(Joi.ref('from')).optional(),
  }),
};

const scopedList = {
  query: pagination.keys({
    assignedTo: objectId.optional(),
  }),
};

const byId = { params: idParam };

module.exports = { create, update, list, scopedList, byId };
