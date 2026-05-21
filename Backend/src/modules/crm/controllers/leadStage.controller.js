const asyncHandler = require('../../../utils/asyncHandler');
const ApiResponse = require('../../../utils/ApiResponse');
const leadStageService = require('../services/leadStage.service');

const create = asyncHandler(async (req, res) => {
  const stage = await leadStageService.create(req.body);
  ApiResponse.created(res, { stage }, 'Stage created');
});

const list = asyncHandler(async (_req, res) => {
  const stages = await leadStageService.list();
  ApiResponse.ok(res, stages, 'Stages fetched');
});

const getOne = asyncHandler(async (req, res) => {
  const stage = await leadStageService.getById(req.params.id);
  ApiResponse.ok(res, { stage }, 'Stage fetched');
});

const update = asyncHandler(async (req, res) => {
  const stage = await leadStageService.update(req.params.id, req.body);
  ApiResponse.ok(res, { stage }, 'Stage updated');
});

const reorder = asyncHandler(async (req, res) => {
  const stages = await leadStageService.reorder(req.body.items);
  ApiResponse.ok(res, stages, 'Stages reordered');
});

const bulkSync = asyncHandler(async (req, res) => {
  const result = await leadStageService.bulkSync(req.body.steps);
  ApiResponse.ok(res, result, 'Stages saved');
});

const activate = asyncHandler(async (req, res) => {
  const stage = await leadStageService.activate(req.params.id);
  ApiResponse.ok(res, { stage }, 'Stage activated');
});

const deactivate = asyncHandler(async (req, res) => {
  const stage = await leadStageService.deactivate(req.params.id);
  ApiResponse.ok(res, { stage }, 'Stage deactivated');
});

const remove = asyncHandler(async (req, res) => {
  await leadStageService.remove(req.params.id);
  ApiResponse.ok(res, null, 'Stage deleted');
});

module.exports = {
  create,
  list,
  getOne,
  update,
  reorder,
  bulkSync,
  activate,
  deactivate,
  remove,
};
