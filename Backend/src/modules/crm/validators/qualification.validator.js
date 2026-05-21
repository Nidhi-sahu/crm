const Joi = require('joi');
const { objectId, idParam, pagination } = require('../../../validators/common.validator');
const { TEMPERATURE_VALUES } = require('../../../constants/temperatures');
const { QUALIFICATION_STATUS_VALUES } = require('../../../constants/statuses');

const answerSchema = Joi.object({
  questionId: Joi.string().optional().allow(null, ''),
  questionText: Joi.string().trim().required(),
  questionType: Joi.string().valid('text', 'radio', 'dropdown', 'checkbox', 'textarea', 'number').default('text'),
  answer: Joi.any().required(),
  weight: Joi.number().min(0).max(100).optional(),
});

const create = {
  body: Joi.object({
    enquiryId: objectId.required(),
    answers: Joi.array().items(answerSchema).default([]),
    score: Joi.number().min(0).max(100).optional(),
    leadTemperature: Joi.string().valid(...TEMPERATURE_VALUES).optional(),
    remarks: Joi.string().trim().max(2000).optional().allow(''),
    nextFollowupAt: Joi.date().iso().optional().allow(null),
  }),
};

const update = {
  params: idParam,
  body: Joi.object({
    answers: Joi.array().items(answerSchema).optional(),
    score: Joi.number().min(0).max(100).optional(),
    leadTemperature: Joi.string().valid(...TEMPERATURE_VALUES).optional(),
    remarks: Joi.string().trim().max(2000).optional().allow(''),
    nextFollowupAt: Joi.date().iso().optional().allow(null),
  }).min(1),
};

const list = {
  query: pagination.keys({
    qualificationStatus: Joi.string().valid(...QUALIFICATION_STATUS_VALUES).optional(),
    leadTemperature: Joi.string().valid(...TEMPERATURE_VALUES).optional(),
    enquiryId: objectId.optional(),
  }),
};

const reject = {
  params: idParam,
  body: Joi.object({
    reason: Joi.string().trim().min(2).max(500).required(),
  }),
};

const hold = {
  params: idParam,
  body: Joi.object({
    holdUntil: Joi.date().iso().optional().allow(null),
    remarks: Joi.string().trim().max(2000).optional().allow(''),
  }),
};

const byId = { params: idParam };
const byEnquiry = { params: Joi.object({ enquiryId: objectId.required() }) };

module.exports = { create, update, list, reject, hold, byId, byEnquiry };
