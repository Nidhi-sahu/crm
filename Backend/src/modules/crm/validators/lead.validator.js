const Joi = require('joi');
const { objectId, idParam, pagination } = require('../../../validators/common.validator');
const { TEMPERATURE_VALUES } = require('../../../constants/temperatures');
const { SOURCE_VALUES } = require('../../../constants/sources');
const { LEAD_STATUS_VALUES } = require('../../../constants/statuses');

const fromEnquiry = {
  params: Joi.object({ enquiryId: objectId.required() }),
};

const update = {
  params: idParam,
  body: Joi.object({
    temperature: Joi.string().valid(...TEMPERATURE_VALUES).optional(),
    project: Joi.string().trim().max(100).optional().allow(''),
    propertyType: Joi.string().trim().max(50).optional().allow(''),
    budget: Joi.number().min(0).optional(),
    expectedRevenue: Joi.number().min(0).optional(),
    actualValue: Joi.number().min(0).allow(null).optional(),
  }).min(1),
};

const list = {
  query: pagination.keys({
    status: Joi.string().valid(...LEAD_STATUS_VALUES).optional(),
    temperature: Joi.string().valid(...TEMPERATURE_VALUES).optional(),
    source: Joi.string().valid(...SOURCE_VALUES).optional(),
    currentStageId: objectId.optional(),
    assignedTo: objectId.optional(),
    from: Joi.date().iso().optional(),
    to: Joi.date().iso().min(Joi.ref('from')).optional(),
    activityDate: Joi.date().iso().optional(),
    followupToday: Joi.boolean().optional(),
  }),
};

const attachment = Joi.object({
  url: Joi.string().uri({ relativeOnly: false }).required(),
  name: Joi.string().trim().max(200).optional().allow(''),
  mimeType: Joi.string().trim().max(100).optional().allow(''),
  size: Joi.number().min(0).optional(),
});

const moveStage = {
  params: idParam,
  body: Joi.object({
    toStageId: objectId.required(),
    comment: Joi.string().trim().max(2000).optional().allow(''),
    plannedAt: Joi.date().iso().optional().allow(null),
    attachments: Joi.array().items(attachment).default([]),
  }),
};

const markLost = {
  params: idParam,
  body: Joi.object({
    reason: Joi.string().trim().min(2).max(500).required(),
  }),
};

const markDropped = {
  params: idParam,
  body: Joi.object({
    reason: Joi.string().trim().min(2).max(500).required(),
  }),
};

const byId = { params: idParam };

const visitReport = {
  params: idParam,
  body: Joi.object({
    visitedAt: Joi.date().iso().optional(),
    customerName: Joi.string().trim().max(120).allow(''),
    contactNumber: Joi.string().trim().max(20).allow(''),
    salesPersonName: Joi.string().trim().max(120).allow(''),
    visitorName: Joi.string().trim().max(120).allow(''),
    projectVisited: Joi.string().trim().max(150).allow(''),
    propertyInterested: Joi.string().trim().max(150).allow(''),
    customerBudget: Joi.string().trim().max(60).allow(''),
    customerProfession: Joi.string().trim().max(120).allow(''),
    customerAddress: Joi.string().trim().max(300).allow(''),
    sourceOfCustomer: Joi.string().trim().max(60).allow(''),
    seniorPerson: Joi.string().trim().max(120).allow(''),
    visitNumber: Joi.string().valid('1st', '2nd', '3rd', '4th+').optional(),
    photoUrl: Joi.string().trim().max(500).allow(''),
  }),
};

module.exports = { fromEnquiry, update, list, moveStage, markLost, markDropped, byId, visitReport };
