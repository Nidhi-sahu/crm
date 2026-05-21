const auditLogRepo = require('../repositories/auditLog.repository');
const ApiError = require('../../../utils/ApiError');
const { buildSkip } = require('../../../utils/pagination');
const logger = require('../../../utils/logger');

const log = async ({
  module,
  action,
  actor = null,
  refType = null,
  refId = null,
  oldData = null,
  newData = null,
  meta = {},
  ipAddress = '',
  userAgent = '',
  success = true,
  errorMessage = '',
}) => {
  try {
    return await auditLogRepo.create({
      module,
      action,
      performedBy: actor && actor._id ? actor._id : null,
      performedByEmail: actor && actor.email ? actor.email : '',
      refType,
      refId,
      oldData,
      newData,
      meta,
      ipAddress,
      userAgent,
      success,
      errorMessage,
    });
  } catch (err) {
    logger.warn('Audit log write failed', { err: err && err.message, module, action });
    return null;
  }
};

const list = async (query = {}) => {
  const {
    page = 1,
    limit = 20,
    module,
    action,
    performedBy,
    refType,
    refId,
    success,
    from,
    to,
  } = query;

  const filter = {};
  if (module) filter.module = module;
  if (action) filter.action = action;
  if (performedBy) filter.performedBy = performedBy;
  if (refType) filter.refType = refType;
  if (refId) filter.refId = refId;
  if (success !== undefined) filter.success = success;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  const skip = buildSkip({ page, limit });
  const [items, total] = await Promise.all([
    auditLogRepo.findAll({ filter, skip, limit: Number(limit) }),
    auditLogRepo.countAll(filter),
  ]);
  return { items, total, page: Number(page), limit: Number(limit) };
};

const getById = async (id) => {
  const log = await auditLogRepo.findById(id);
  if (!log) throw ApiError.notFound('Audit log not found');
  return log;
};

module.exports = { log, list, getById };
