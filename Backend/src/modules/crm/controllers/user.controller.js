const asyncHandler = require('../../../utils/asyncHandler');
const ApiResponse = require('../../../utils/ApiResponse');
const userService = require('../services/user.service');
const { buildMeta } = require('../../../utils/pagination');

const create = asyncHandler(async (req, res) => {
  const user = await userService.create(req.body, req.user);
  ApiResponse.created(res, { user }, 'User created');
});

const list = asyncHandler(async (req, res) => {
  const { items, total, page, limit } = await userService.list(req.query);
  ApiResponse.ok(res, items, 'Users fetched', buildMeta({ page, limit, total }));
});

const getOne = asyncHandler(async (req, res) => {
  const user = await userService.getById(req.params.id);
  ApiResponse.ok(res, { user }, 'User fetched');
});

const update = asyncHandler(async (req, res) => {
  const user = await userService.update(req.params.id, req.body, req.user);
  ApiResponse.ok(res, { user }, 'User updated');
});

const activate = asyncHandler(async (req, res) => {
  const user = await userService.setStatus(req.params.id, 'active', req.user);
  ApiResponse.ok(res, { user }, 'User activated');
});

const deactivate = asyncHandler(async (req, res) => {
  const user = await userService.setStatus(req.params.id, 'inactive', req.user);
  ApiResponse.ok(res, { user }, 'User deactivated');
});

const assignRole = asyncHandler(async (req, res) => {
  const user = await userService.assignRole(req.params.id, req.body.roleId, req.user);
  ApiResponse.ok(res, { user }, 'Role assigned');
});

const remove = asyncHandler(async (req, res) => {
  await userService.remove(req.params.id, req.user);
  ApiResponse.ok(res, null, 'User deleted');
});

module.exports = { create, list, getOne, update, activate, deactivate, assignRole, remove };
