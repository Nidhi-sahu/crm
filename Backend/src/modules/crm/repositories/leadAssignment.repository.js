const LeadAssignment = require('../models/leadAssignment.model');

const create = (data) => LeadAssignment.create(data);

const findByLeadId = (leadId, { limit = 100 } = {}) =>
  LeadAssignment.find({ leadId })
    .populate({ path: 'assignedTo', select: 'name email' })
    .populate({ path: 'assignedBy', select: 'name email' })
    .populate({ path: 'previousAssignee', select: 'name email' })
    .sort({ assignedAt: -1 })
    .limit(limit)
    .lean();

const findAll = ({ filter = {}, sort = { assignedAt: -1 }, skip = 0, limit = 20 }) =>
  LeadAssignment.find(filter)
    .populate({ path: 'leadId', select: 'enquiryId project status' })
    .populate({ path: 'assignedTo', select: 'name email' })
    .populate({ path: 'assignedBy', select: 'name email' })
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

const countAll = (filter = {}) => LeadAssignment.countDocuments(filter);

module.exports = { create, findByLeadId, findAll, countAll };
