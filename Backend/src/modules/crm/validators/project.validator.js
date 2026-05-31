const Joi = require('joi');
const { idParam } = require('../../../validators/common.validator');

const STATUS = ['ongoing', 'upcoming', 'completed'];
const ACCOUNT_TYPES = ['', 'Savings', 'Current'];

const bankDetailsSchema = Joi.object({
  bankName: Joi.string().trim().max(120).allow('').optional(),
  accountHolderName: Joi.string().trim().max(150).allow('').optional(),
  accountNumber: Joi.string().trim().max(30).allow('').optional(),
  ifscCode: Joi.string().trim().max(15).allow('').optional(),
  branch: Joi.string().trim().max(120).allow('').optional(),
  accountType: Joi.string().valid(...ACCOUNT_TYPES).optional(),
  upiId: Joi.string().trim().max(100).allow('').optional(),
}).optional();

const create = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(120).required(),
    location: Joi.string().trim().max(150).allow('').optional(),
    propertyType: Joi.string().trim().max(80).allow('').optional(),
    status: Joi.string().valid(...STATUS).optional(),
    description: Joi.string().trim().max(1000).allow('').optional(),
    isActive: Joi.boolean().optional(),
    bankDetails: bankDetailsSchema,
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
    bankDetails: bankDetailsSchema,
  }).min(1),
};

const byId = { params: idParam };

module.exports = { create, update, byId };
