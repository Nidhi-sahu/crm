const Joi = require('joi');
const { objectId, email, idParam, pagination } = require('../../../validators/common.validator');

const create = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    email: email.required(),
    phone: Joi.string().trim().min(7).max(20).optional().allow(''),
    password: Joi.string().min(8).max(128).required(),
    roleId: objectId.required(),
    additionalRoleIds: Joi.array().items(objectId).default([]),
    additionalPermissions: Joi.array().items(Joi.string()).default([]),
    managerId: objectId.optional().allow(null),
    status: Joi.string().valid('active', 'inactive').default('active'),
  }),
};

const update = {
  params: idParam,
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).optional(),
    email: email.optional(),
    phone: Joi.string().trim().min(7).max(20).optional().allow(''),
    roleId: objectId.optional(),
    additionalRoleIds: Joi.array().items(objectId).optional(),
    additionalPermissions: Joi.array().items(Joi.string()).optional(),
    managerId: objectId.optional().allow(null),
    status: Joi.string().valid('active', 'inactive').optional(),
  }).min(1),
};

const list = {
  query: pagination.keys({
    status: Joi.string().valid('active', 'inactive').optional(),
    roleId: objectId.optional(),
  }),
};

const assignRole = {
  params: idParam,
  body: Joi.object({ roleId: objectId.required() }),
};

const byId = { params: idParam };

module.exports = { create, update, list, assignRole, byId };
