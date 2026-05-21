const Joi = require('joi');
const { idParam, pagination } = require('../../../validators/common.validator');
const { NOTIFICATION_TYPE_VALUES } = require('../../../constants/notificationTypes');

const list = {
  query: pagination.keys({
    unreadOnly: Joi.boolean().optional(),
    type: Joi.string().valid(...NOTIFICATION_TYPE_VALUES).optional(),
  }),
};

const byId = { params: idParam };

module.exports = { list, byId };
