const CallLog = require('../models/callLog.model');

const create = (data) => CallLog.create(data);

const findByLeadId = (leadId) =>
  CallLog.find({ leadId })
    .populate({ path: 'calledBy', select: 'name email' })
    .sort({ calledAt: -1, createdAt: -1 })
    .lean();

const countByLeadId = (leadId) => CallLog.countDocuments({ leadId });

module.exports = { create, findByLeadId, countByLeadId };
