const Joi = require('joi');
const { objectId, idParam, pagination } = require('../../../validators/common.validator');
const { ASSIGNMENT_TRIGGER_VALUES } = require('../../../constants/assignmentTriggers');

const assign = {
  params: idParam,
  body: Joi.object({
    assignedTo: objectId.required(),
    reason: Joi.string().trim().max(500).optional().allow(''),
  }),
};

const unassign = {
  params: idParam,
  body: Joi.object({
    reason: Joi.string().trim().max(500).optional().allow(''),
  }),
};

const assignVisit = {
  params: idParam,
  body: Joi.object({
    visitAssignedTo: objectId.required(),
    reason: Joi.string().trim().max(500).optional().allow(''),
  }),
};

const unassignVisit = {
  params: idParam,
  body: Joi.object({
    reason: Joi.string().trim().max(500).optional().allow(''),
  }),
};

const autoRun = {
  body: Joi.object({
    delayMinutes: Joi.number().integer().min(0).optional(),
    batchSize: Joi.number().integer().min(1).max(500).optional(),
  }),
};

const list = {
  query: pagination.keys({
    leadId: objectId.optional(),
    assignedTo: objectId.optional(),
    assignedBy: objectId.optional(),
    autoAssigned: Joi.boolean().optional(),
    triggerType: Joi.string().valid(...ASSIGNMENT_TRIGGER_VALUES).optional(),
    from: Joi.date().iso().optional(),
    to: Joi.date().iso().min(Joi.ref('from')).optional(),
  }),
};

const byId = { params: idParam };

module.exports = { assign, unassign, assignVisit, unassignVisit, autoRun, list, byId };
