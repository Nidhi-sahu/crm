const Joi = require('joi');
const { objectId, idParam, email } = require('../../../validators/common.validator');

const create = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(120).required(),
    email: email.required(),
    phone: Joi.string().trim().max(20).allow('').optional(),
    password: Joi.string().min(8).max(128).allow('').optional(),
    managedBySalesId: objectId.allow(null).optional(),
    managedByVisitId: objectId.allow(null).optional(),
  }),
};

const update = {
  params: idParam,
  body: Joi.object({
    name: Joi.string().trim().min(2).max(120).optional(),
    phone: Joi.string().trim().max(20).allow('').optional(),
    managedBySalesId: objectId.allow(null).optional(),
    managedByVisitId: objectId.allow(null).optional(),
  }).min(1),
};

const byId = { params: idParam };

module.exports = { create, update, byId };
