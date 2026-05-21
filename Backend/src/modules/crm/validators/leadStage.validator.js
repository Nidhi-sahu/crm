const Joi = require('joi');
const { objectId, idParam } = require('../../../validators/common.validator');

const create = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    order: Joi.number().integer().min(1).required(),
    color: Joi.string().trim().max(20).optional(),
    description: Joi.string().trim().max(255).optional().allow(''),
    assignedRoles: Joi.array().items(Joi.string().trim()).default([]),
    requiredFields: Joi.array().items(Joi.string().trim()).default([]),
    allowedNextStages: Joi.array().items(objectId).default([]),
    slaHours: Joi.number().min(0).optional(),
    isActive: Joi.boolean().optional(),
    isInitial: Joi.boolean().optional(),
    isFinal: Joi.boolean().optional(),
  }),
};

const update = {
  params: idParam,
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).optional(),
    order: Joi.number().integer().min(1).optional(),
    color: Joi.string().trim().max(20).optional(),
    description: Joi.string().trim().max(255).optional().allow(''),
    assignedRoles: Joi.array().items(Joi.string().trim()).optional(),
    requiredFields: Joi.array().items(Joi.string().trim()).optional(),
    allowedNextStages: Joi.array().items(objectId).optional(),
    slaHours: Joi.number().min(0).optional(),
    isActive: Joi.boolean().optional(),
    isInitial: Joi.boolean().optional(),
    isFinal: Joi.boolean().optional(),
  }).min(1),
};

const reorder = {
  body: Joi.object({
    items: Joi.array()
      .items(Joi.object({ id: objectId.required(), order: Joi.number().integer().min(1).required() }))
      .min(1)
      .required(),
  }),
};

const bulkSync = {
  body: Joi.object({
    steps: Joi.array()
      .items(
        Joi.object({
          id: objectId.optional(),
          name: Joi.string().trim().min(2).max(100).required(),
        }),
      )
      .min(1)
      .required(),
  }),
};

const byId = { params: idParam };

module.exports = { create, update, reorder, bulkSync, byId };
