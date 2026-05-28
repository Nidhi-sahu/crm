const asyncHandler = require('../../../utils/asyncHandler');
const ApiResponse = require('../../../utils/ApiResponse');
const leadService = require('../services/lead.service');
const { buildMeta } = require('../../../utils/pagination');

const createFromEnquiry = asyncHandler(async (req, res) => {
  const lead = await leadService.createFromEnquiry(req.params.enquiryId, req.user);
  ApiResponse.created(res, { lead }, 'Lead created from enquiry');
});

const list = asyncHandler(async (req, res) => {
  const { items, total, page, limit } = await leadService.list(req.query, req.user);
  ApiResponse.ok(res, items, 'Leads fetched', buildMeta({ page, limit, total }));
});

const getOne = asyncHandler(async (req, res) => {
  const lead = await leadService.getById(req.params.id);
  ApiResponse.ok(res, { lead }, 'Lead fetched');
});

const update = asyncHandler(async (req, res) => {
  const lead = await leadService.update(req.params.id, req.body, req.user);
  ApiResponse.ok(res, { lead }, 'Lead updated');
});

const moveStage = asyncHandler(async (req, res) => {
  const lead = await leadService.moveStage(req.params.id, req.body, req.user);
  ApiResponse.ok(res, { lead }, 'Stage moved');
});

const undoStage = asyncHandler(async (req, res) => {
  const lead = await leadService.undoStage(req.params.id, req.user);
  ApiResponse.ok(res, { lead }, 'Stage reverted');
});

const getHistory = asyncHandler(async (req, res) => {
  const history = await leadService.getHistory(req.params.id);
  ApiResponse.ok(res, history, 'Stage history fetched');
});

const markWon = asyncHandler(async (req, res) => {
  const lead = await leadService.markWon(req.params.id, req.user);
  ApiResponse.ok(res, { lead }, 'Lead marked as won');
});

const markLost = asyncHandler(async (req, res) => {
  const lead = await leadService.markLost(req.params.id, req.body.reason, req.user);
  ApiResponse.ok(res, { lead }, 'Lead marked as lost');
});

const markDropped = asyncHandler(async (req, res) => {
  const lead = await leadService.markDropped(req.params.id, req.body.reason, req.user);
  ApiResponse.ok(res, { lead }, 'Lead marked as dropped');
});

const remove = asyncHandler(async (req, res) => {
  await leadService.remove(req.params.id);
  ApiResponse.ok(res, null, 'Lead deleted');
});

module.exports = {
  createFromEnquiry,
  list,
  getOne,
  update,
  moveStage,
  undoStage,
  getHistory,
  markWon,
  markLost,
  markDropped,
  remove,
};
