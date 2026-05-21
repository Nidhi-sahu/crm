const asyncHandler = require('../../../utils/asyncHandler');
const ApiResponse = require('../../../utils/ApiResponse');
const auditLogService = require('../services/auditLog.service');
const { buildMeta } = require('../../../utils/pagination');

const list = asyncHandler(async (req, res) => {
  const { items, total, page, limit } = await auditLogService.list(req.query);
  ApiResponse.ok(res, items, 'Audit logs fetched', buildMeta({ page, limit, total }));
});

const getOne = asyncHandler(async (req, res) => {
  const log = await auditLogService.getById(req.params.id);
  ApiResponse.ok(res, { log }, 'Audit log fetched');
});

module.exports = { list, getOne };
