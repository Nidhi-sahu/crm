const asyncHandler = require('../../../utils/asyncHandler');
const ApiResponse = require('../../../utils/ApiResponse');
const permissionService = require('../services/permission.service');

const list = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.module) filter.module = req.query.module;
  if (req.query.action) filter.action = req.query.action;
  const perms = await permissionService.list(filter);
  ApiResponse.ok(res, perms, 'Permissions fetched');
});

module.exports = { list };
