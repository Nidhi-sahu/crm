const AuditLog = require('../models/auditLog.model');

const create = (data) => AuditLog.create(data);

const findById = (id) =>
  AuditLog.findById(id).populate({ path: 'performedBy', select: 'name email' }).lean();

const findAll = ({ filter = {}, sort = { createdAt: -1 }, skip = 0, limit = 20 }) =>
  AuditLog.find(filter)
    .populate({ path: 'performedBy', select: 'name email' })
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

const countAll = (filter = {}) => AuditLog.countDocuments(filter);

module.exports = { create, findById, findAll, countAll };
