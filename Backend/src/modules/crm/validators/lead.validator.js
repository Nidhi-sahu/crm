const Joi = require('joi');
const { objectId, idParam, pagination } = require('../../../validators/common.validator');
const { TEMPERATURE_VALUES } = require('../../../constants/temperatures');
const { SOURCE_VALUES } = require('../../../constants/sources');
const { LEAD_STATUS_VALUES } = require('../../../constants/statuses');

const fromEnquiry = {
  params: Joi.object({ enquiryId: objectId.required() }),
};

const walkin = {
  body: Joi.object({
    clientName: Joi.string().trim().min(2).max(120).required(),
    clientEmail: Joi.string().trim().email().allow('').optional(),
    companyName: Joi.string().trim().max(120).allow('').optional(),
    project: Joi.string().trim().max(120).allow('').optional(),
    propertyType: Joi.string().trim().max(80).allow('').optional(),
    budget: Joi.number().min(0).optional(),
    requirement: Joi.string().trim().max(1000).allow('').optional(),
    visitDate: Joi.date().iso().optional(),
    visitReport: Joi.object({
      visitedAt: Joi.date().iso().optional(),
      customerName: Joi.string().trim().max(120).allow('').optional(),
      contactNumber: Joi.string().trim().max(20).allow('').optional(),
      salesPersonName: Joi.string().trim().max(120).allow('').optional(),
      visitorName: Joi.string().trim().max(120).allow('').optional(),
      projectVisited: Joi.string().trim().max(150).allow('').optional(),
      propertyInterested: Joi.string().trim().max(150).allow('').optional(),
      firstPreference: Joi.string().trim().max(150).allow('').optional(),
      secondPreference: Joi.string().trim().max(150).allow('').optional(),
      customerBudget: Joi.string().trim().max(60).allow('').optional(),
      customerProfession: Joi.string().trim().max(120).allow('').optional(),
      customerAddress: Joi.string().trim().max(300).allow('').optional(),
      sourceOfCustomer: Joi.string().trim().max(60).allow('').optional(),
      seniorPerson: Joi.string().trim().max(120).allow('').optional(),
      visitNumber: Joi.string().valid('1st', '2nd', '3rd', '4th+').optional(),
      photoUrl: Joi.string().trim().max(500).allow('').optional(),
    }).optional(),
  }),
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
    assigned: Joi.boolean().optional(),
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

const moveBackFromVisit = {
  params: idParam,
  body: Joi.object({
    targetStageOrder: Joi.number().integer().min(1).max(3).required(),
    telesalesAssignedTo: objectId.required(),
    reason: Joi.string().trim().min(15).max(2000).required(),
  }),
};

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
    firstPreference: Joi.string().trim().max(150).allow(''),
    secondPreference: Joi.string().trim().max(150).allow(''),
    customerBudget: Joi.string().trim().max(60).allow(''),
    customerProfession: Joi.string().trim().max(120).allow(''),
    customerAddress: Joi.string().trim().max(300).allow(''),
    sourceOfCustomer: Joi.string().trim().max(60).allow(''),
    seniorPerson: Joi.string().trim().max(120).allow(''),
    visitNumber: Joi.string().valid('1st', '2nd', '3rd', '4th+').optional(),
    photoUrl: Joi.string().trim().max(500).allow(''),
    // Geo-location of the submitter (Visit Form location restriction).
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional(),
    accuracy: Joi.number().min(0).optional(),
  }),
};

const logCall = {
  params: idParam,
  body: Joi.object({
    phoneNumber: Joi.string().trim().max(20).allow('').optional(),
    direction: Joi.string().valid('outbound', 'inbound').optional(),
    outcome: Joi.string()
      .valid('connected', 'not_picked', 'busy', 'switched_off', 'wrong_number', 'call_back_later')
      .optional(),
    durationSeconds: Joi.number().integer().min(0).max(86400).optional(),
    stageName: Joi.string().trim().max(120).allow('').optional(),
    notes: Joi.string().trim().max(2000).allow('').optional(),
    calledAt: Joi.date().iso().optional(),
  }),
};

const whatsappSend = {
  params: idParam,
  body: Joi.object({
    toNumber: Joi.string().trim().max(20).allow('').optional(),
    type: Joi.string().valid('text', 'template').optional(),
    body: Joi.string().trim().max(4000).allow('').optional(),
    templateName: Joi.string().trim().max(120).allow('').optional(),
    languageCode: Joi.string().trim().max(10).optional(),
    bodyParams: Joi.array().items(Joi.string().max(500)).optional(),
  }),
};

module.exports = { fromEnquiry, walkin, update, list, moveStage, moveBackFromVisit, markLost, markDropped, byId, visitReport, logCall, whatsappSend };
