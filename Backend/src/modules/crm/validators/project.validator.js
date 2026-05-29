const Joi = require('joi');
const { idParam } = require('../../../validators/common.validator');

const STATUS = ['ongoing', 'upcoming', 'completed'];

const create = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(120).required(),
    location: Joi.string().trim().max(150).allow('').optional(),
    propertyType: Joi.string().trim().max(80).allow('').optional(),
    status: Joi.string().valid(...STATUS).optional(),
    description: Joi.string().trim().max(1000).allow('').optional(),
    isActive: Joi.boolean().optional(),
  }),
};

const update = {
  params: idParam,
  body: Joi.object({
    name: Joi.string().trim().min(2).max(120).optional(),
    location: Joi.string().trim().max(150).allow('').optional(),
    propertyType: Joi.string().trim().max(80).allow('').optional(),
    status: Joi.string().valid(...STATUS).optional(),
    description: Joi.string().trim().max(1000).allow('').optional(),
    isActive: Joi.boolean().optional(),
  }).min(1),
};

const byId = { params: idParam };

module.exports = { create, update, byId };
