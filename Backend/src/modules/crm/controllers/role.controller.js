const asyncHandler = require('../../../utils/asyncHandler');
const ApiResponse = require('../../../utils/ApiResponse');
const roleService = require('../services/role.service');

const create = asyncHandler(async (req, res) => {
  const role = await roleService.create(req.body);
  ApiResponse.created(res, { role }, 'Role created');
});

const list = asyncHandler(async (_req, res) => {
  const roles = await roleService.list();
  ApiResponse.ok(res, roles, 'Roles fetched');
});

const getOne = asyncHandler(async (req, res) => {
  const role = await roleService.getById(req.params.id);
  ApiResponse.ok(res, { role }, 'Role fetched');
});

const update = asyncHandler(async (req, res) => {
  const role = await roleService.update(req.params.id, req.body);
  ApiResponse.ok(res, { role }, 'Role updated');
});

const remove = asyncHandler(async (req, res) => {
  await roleService.remove(req.params.id);
  ApiResponse.ok(res, null, 'Role deleted');
});

module.exports = { create, list, getOne, update, remove };
