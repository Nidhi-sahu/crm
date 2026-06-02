const WhatsappMessage = require('../models/whatsappMessage.model');

const create = (data) => WhatsappMessage.create(data);

const findByLeadId = (leadId) =>
  WhatsappMessage.find({ leadId })
    .populate({ path: 'sentBy', select: 'name email' })
    .sort({ createdAt: -1 })
    .lean();

const countByLeadId = (leadId) => WhatsappMessage.countDocuments({ leadId });

const updateStatusByProviderId = (providerMessageId, patch) =>
  WhatsappMessage.findOneAndUpdate({ providerMessageId }, { $set: patch }, { new: true });

module.exports = { create, findByLeadId, countByLeadId, updateStatusByProviderId };
