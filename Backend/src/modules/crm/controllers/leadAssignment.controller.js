const asyncHandler = require('../../../utils/asyncHandler');
const ApiResponse = require('../../../utils/ApiResponse');
const leadAssignmentService = require('../services/leadAssignment.service');
const { buildMeta } = require('../../../utils/pagination');

const assign = asyncHandler(async (req, res) => {
  const lead = await leadAssignmentService.assign(req.params.id, req.body, req.user);
  ApiResponse.ok(res, { lead }, 'Lead assigned');
});

const unassign = asyncHandler(async (req, res) => {
  const lead = await leadAssignmentService.unassign(req.params.id, req.body, req.user);
  ApiResponse.ok(res, { lead }, 'Lead unassigned');
});

const getHistory = asyncHandler(async (req, res) => {
  const history = await leadAssignmentService.getHistoryForLead(req.params.id);
  ApiResponse.ok(res, history, 'Assignment history fetched');
});

const list = asyncHandler(async (req, res) => {
  const { items, total, page, limit } = await leadAssignmentService.list(req.query);
  ApiResponse.ok(res, items, 'Assignments fetched', buildMeta({ page, limit, total }));
});

const autoRun = asyncHandler(async (req, res) => {
  const result = await leadAssignmentService.runAutoAssignSweep(req.body || {});
  ApiResponse.ok(res, result, 'Auto-assignment sweep completed');
});

module.exports = { assign, unassign, getHistory, list, autoRun };
