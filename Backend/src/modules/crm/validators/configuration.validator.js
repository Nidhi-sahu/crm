const Joi = require('joi');

const keyPattern = /^[a-z0-9._-]{2,80}$/;

const set = {
  params: Joi.object({ key: Joi.string().pattern(keyPattern).required() }),
  body: Joi.object({
    value: Joi.any().required(),
    category: Joi.string().trim().max(50).optional(),
    description: Joi.string().trim().max(500).optional().allow(''),
  }),
};

const bulkSet = {
  body: Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          key: Joi.string().pattern(keyPattern).required(),
          value: Joi.any().required(),
          category: Joi.string().trim().max(50).optional(),
          description: Joi.string().trim().max(500).optional().allow(''),
        })
      )
      .min(1)
      .max(50)
      .required(),
  }),
};

const list = {
  query: Joi.object({
    category: Joi.string().trim().max(50).optional(),
  }),
};

const byKey = {
  params: Joi.object({ key: Joi.string().pattern(keyPattern).required() }),
};

module.exports = { set, bulkSet, list, byKey };
