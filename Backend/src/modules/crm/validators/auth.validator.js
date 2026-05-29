const Joi = require('joi');
const { email } = require('../../../validators/common.validator');

const login = {
  body: Joi.object({
    email: email.required(),
    password: Joi.string().min(6).max(128).required(),
  }),
};

const googleLogin = {
  body: Joi.object({
    credential: Joi.string().required(),
  }),
};

const refresh = {
  body: Joi.object({
    refreshToken: Joi.string().optional(),
  }),
};

const forgotPassword = {
  body: Joi.object({
    email: email.required(),
  }),
};

const resetPassword = {
  body: Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(8).max(128).required(),
  }),
};

const changePassword = {
  body: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).max(128).required(),
  }),
};

module.exports = { login, googleLogin, refresh, forgotPassword, resetPassword, changePassword };
