const asyncHandler = require('../../../utils/asyncHandler');
const ApiResponse = require('../../../utils/ApiResponse');
const reportService = require('../services/report.service');

const conversionFunnel = asyncHandler(async (req, res) => {
  const data = await reportService.conversionFunnel(req.query);
  ApiResponse.ok(res, data, 'Conversion funnel');
});

const sourceAnalytics = asyncHandler(async (req, res) => {
  const data = await reportService.sourceAnalytics(req.query);
  ApiResponse.ok(res, data, 'Source analytics');
});

const lostReasons = asyncHandler(async (req, res) => {
  const data = await reportService.lostReasons(req.query);
  ApiResponse.ok(res, data, 'Lost reasons');
});

const avgCompletionTime = asyncHandler(async (req, res) => {
  const data = await reportService.avgCompletionTime(req.query);
  ApiResponse.ok(res, data, 'Average completion time');
});

const stageDelay = asyncHandler(async (_req, res) => {
  const data = await reportService.stageDelay();
  ApiResponse.ok(res, data, 'Stage delay analysis');
});

const salespersonScorecard = asyncHandler(async (req, res) => {
  const data = await reportService.salespersonScorecard(req.query);
  ApiResponse.ok(res, data, 'Salesperson scorecard');
});

const overdueFollowups = asyncHandler(async (req, res) => {
  const data = await reportService.overdueFollowups(req.query);
  ApiResponse.ok(res, data, 'Overdue followups report');
});

module.exports = {
  conversionFunnel,
  sourceAnalytics,
  lostReasons,
  avgCompletionTime,
  stageDelay,
  salespersonScorecard,
  overdueFollowups,
};
