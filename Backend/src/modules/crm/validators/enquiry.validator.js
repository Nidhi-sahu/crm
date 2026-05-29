const Joi = require('joi');
const { objectId, email, idParam, pagination } = require('../../../validators/common.validator');
const { SOURCE_VALUES } = require('../../../constants/sources');
const { TEMPERATURE_VALUES } = require('../../../constants/temperatures');
const { ENQUIRY_STATUS_VALUES } = require('../../../constants/statuses');
const { CLIENT_TYPE_VALUES } = require('../../../constants/clientTypes');

const baseFields = {
  clientName: Joi.string().trim().min(2).max(100),
  companyName: Joi.string().trim().max(100).allow(''),
  clientType: Joi.string().valid('', ...CLIENT_TYPE_VALUES).allow(''),
  clientEmail: email.allow(''),
  clientPhone: Joi.string().trim().min(7).max(20),
  alternatePhone: Joi.string().trim().min(7).max(20).allow(''),
  dateOfEnquiry: Joi.date().iso().allow(null),
  source: Joi.string().valid(...SOURCE_VALUES),
  brokerName: Joi.string().trim().max(120).allow(''),
  propertyType: Joi.string().trim().max(50).allow(''),
  project: Joi.string().trim().max(100).allow(''),
  budgetMin: Joi.number().min(0),
  budgetMax: Joi.number().min(0),
  timeline: Joi.string().trim().max(50).allow(''),
  temperature: Joi.string().valid(...TEMPERATURE_VALUES),
  status: Joi.string().valid(...ENQUIRY_STATUS_VALUES),
  remarks: Joi.string().trim().max(2000).allow(''),
  nextFollowupAt: Joi.date().iso().allow(null),
  followupTime: Joi.string().pattern(/^\d{2}:\d{2}$/).allow(''),
  city: Joi.string().trim().max(80).allow(''),
  state: Joi.string().trim().max(80).allow(''),
  requirement: Joi.string().trim().max(500).allow(''),
  preferredLocation: Joi.string().trim().max(120).allow(''),
  preferredVisitDate: Joi.date().iso().allow(null),
  familySize: Joi.number().integer().min(0).allow(null),
  assignedQualificationUser: objectId.allow(null),
  qualificationAnswers: Joi.object(),
};

const create = {
  body: Joi.object({
    clientName: baseFields.clientName.required(),
    companyName: baseFields.companyName.optional(),
    clientType: baseFields.clientType.optional(),
    clientEmail: baseFields.clientEmail.optional(),
    clientPhone: baseFields.clientPhone.required(),
    alternatePhone: baseFields.alternatePhone.optional(),
    dateOfEnquiry: baseFields.dateOfEnquiry.optional(),
    source: baseFields.source.required(),
    brokerName: baseFields.brokerName.optional(),
    propertyType: baseFields.propertyType.optional(),
    project: baseFields.project.optional(),
    budgetMin: baseFields.budgetMin.optional(),
    budgetMax: Joi.number().min(Joi.ref('budgetMin')).optional(),
    timeline: baseFields.timeline.optional(),
    temperature: baseFields.temperature.optional(),
    status: baseFields.status.optional(),
    remarks: baseFields.remarks.optional(),
    nextFollowupAt: baseFields.nextFollowupAt.optional(),
    followupTime: baseFields.followupTime.optional(),
    city: baseFields.city.optional(),
    state: baseFields.state.optional(),
    requirement: baseFields.requirement.optional(),
    preferredLocation: baseFields.preferredLocation.optional(),
    preferredVisitDate: baseFields.preferredVisitDate.optional(),
    familySize: baseFields.familySize.optional(),
    assignedQualificationUser: baseFields.assignedQualificationUser.optional(),
    qualificationAnswers: baseFields.qualificationAnswers.optional(),
  }),
};

const update = {
  params: idParam,
  body: Joi.object({
    clientName: baseFields.clientName.optional(),
    companyName: baseFields.companyName.optional(),
    clientType: baseFields.clientType.optional(),
    clientEmail: baseFields.clientEmail.optional(),
    clientPhone: baseFields.clientPhone.optional(),
    alternatePhone: baseFields.alternatePhone.optional(),
    dateOfEnquiry: baseFields.dateOfEnquiry.optional(),
    source: baseFields.source.optional(),
    brokerName: baseFields.brokerName.optional(),
    propertyType: baseFields.propertyType.optional(),
    project: baseFields.project.optional(),
    budgetMin: baseFields.budgetMin.optional(),
    budgetMax: baseFields.budgetMax.optional(),
    timeline: baseFields.timeline.optional(),
    temperature: baseFields.temperature.optional(),
    status: baseFields.status.optional(),
    remarks: baseFields.remarks.optional(),
    nextFollowupAt: baseFields.nextFollowupAt.optional(),
    followupTime: baseFields.followupTime.optional(),
    city: baseFields.city.optional(),
    state: baseFields.state.optional(),
    requirement: baseFields.requirement.optional(),
    preferredLocation: baseFields.preferredLocation.optional(),
    preferredVisitDate: baseFields.preferredVisitDate.optional(),
    familySize: baseFields.familySize.optional(),
    assignedQualificationUser: baseFields.assignedQualificationUser.optional(),
    qualificationAnswers: baseFields.qualificationAnswers.optional(),
  }).min(1),
};

const list = {
  query: pagination.keys({
    status: Joi.alternatives()
      .try(
        Joi.string().valid(...ENQUIRY_STATUS_VALUES),
        Joi.array().items(Joi.string().valid(...ENQUIRY_STATUS_VALUES)),
      )
      .optional(),
    source: Joi.string().valid(...SOURCE_VALUES).optional(),
    temperature: Joi.string().valid(...TEMPERATURE_VALUES).optional(),
    createdBy: objectId.optional(),
    assignedQualificationUser: objectId.optional(),
    assignedTo: objectId.optional(),
    from: Joi.date().iso().optional(),
    to: Joi.date().iso().min(Joi.ref('from')).optional(),
    activityDate: Joi.date().iso().optional(),
    followupToday: Joi.boolean().optional(),
  }),
};

const setFollowup = {
  params: idParam,
  body: Joi.object({
    nextFollowupAt: Joi.date().iso().allow(null).required(),
  }),
};

const byId = { params: idParam };

const checkPhone = {
  query: Joi.object({
    phone: Joi.string().trim().min(3).max(20).required(),
    excludeId: objectId.optional(),
  }),
};

const bulkImport = {
  body: Joi.object({
    source: baseFields.source.required(),
    rows: Joi.array()
      .items(
        Joi.object({
          clientName: Joi.string().trim().allow('').optional(),
          name: Joi.string().trim().allow('').optional(),
          clientPhone: Joi.string().trim().allow('').optional(),
          phone: Joi.string().trim().allow('').optional(),
          clientEmail: Joi.string().trim().allow('').optional(),
          email: Joi.string().trim().allow('').optional(),
          companyName: Joi.string().trim().allow('').optional(),
          city: Joi.string().trim().allow('').optional(),
          remarks: Joi.string().trim().allow('').optional(),
        }).unknown(true),
      )
      .min(1)
      .max(5000)
      .required(),
  }),
};

const bulkAssign = {
  body: Joi.object({
    assignments: Joi.array()
      .items(
        Joi.object({
          enquiryId: objectId.required(),
          userId: objectId.allow(null).required(),
        }),
      )
      .min(1)
      .max(5000)
      .required(),
  }),
};

module.exports = { create, update, list, setFollowup, byId, checkPhone, bulkImport, bulkAssign };
