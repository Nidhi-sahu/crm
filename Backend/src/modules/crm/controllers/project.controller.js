const asyncHandler = require('../../../utils/asyncHandler');
const ApiResponse = require('../../../utils/ApiResponse');
const projectService = require('../services/project.service');

const list = asyncHandler(async (req, res) => {
  const items = await projectService.list(req.query);
  ApiResponse.ok(res, items, 'Projects fetched');
});

const create = asyncHandler(async (req, res) => {
  const project = await projectService.create(req.body, req.user);
  ApiResponse.created(res, { project }, 'Project created');
});

const update = asyncHandler(async (req, res) => {
  const project = await projectService.update(req.params.id, req.body, req.user);
  ApiResponse.ok(res, { project }, 'Project updated');
});

const remove = asyncHandler(async (req, res) => {
  await projectService.remove(req.params.id);
  ApiResponse.ok(res, null, 'Project deleted');
});

module.exports = { list, create, update, remove };
