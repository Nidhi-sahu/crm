const Joi = require('joi');
const { idParam } = require('../../../validators/common.validator');

const create = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(50).required(),
    description: Joi.string().trim().max(255).optional().allow(''),
    permissions: Joi.array().items(Joi.string()).default([]),
  }),
};

const update = {
  params: idParam,
  body: Joi.object({
    name: Joi.string().trim().min(2).max(50).optional(),
    description: Joi.string().trim().max(255).optional().allow(''),
    permissions: Joi.array().items(Joi.string()).optional(),
  }).min(1),
};

const byId = { params: idParam };

module.exports = { create, update, byId };
