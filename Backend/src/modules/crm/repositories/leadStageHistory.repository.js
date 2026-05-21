const LeadStageHistory = require('../models/leadStageHistory.model');

const create = (data) => LeadStageHistory.create(data);

const findByLeadId = (leadId, { limit = 100 } = {}) =>
  LeadStageHistory.find({ leadId })
    .populate({ path: 'fromStageId', select: 'name order color' })
    .populate({ path: 'toStageId', select: 'name order color' })
    .populate({ path: 'movedBy', select: 'name email' })
    .sort({ movedAt: -1 })
    .limit(limit)
    .lean();

const findLastForLead = (leadId) =>
  LeadStageHistory.findOne({ leadId, isUndo: false })
    .sort({ movedAt: -1 })
    .populate({ path: 'fromStageId', select: 'name order' })
    .populate({ path: 'toStageId', select: 'name order' });

const remove = (id) => LeadStageHistory.findByIdAndDelete(id);

module.exports = { create, findByLeadId, findLastForLead, remove };
