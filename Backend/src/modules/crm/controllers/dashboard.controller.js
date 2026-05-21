const asyncHandler = require('../../../utils/asyncHandler');
const ApiResponse = require('../../../utils/ApiResponse');
const dashboardService = require('../services/dashboard.service');

const overview = asyncHandler(async (req, res) => {
  const data = await dashboardService.overview(req.query);
  ApiResponse.ok(res, data, 'Dashboard overview');
});

const stageFunnel = asyncHandler(async (req, res) => {
  const data = await dashboardService.stageFunnel(req.query);
  ApiResponse.ok(res, data, 'Stage funnel');
});

const salespersonPerformance = asyncHandler(async (req, res) => {
  const data = await dashboardService.salespersonPerformance(req.query);
  ApiResponse.ok(res, data, 'Salesperson performance');
});

const sourceBreakdown = asyncHandler(async (req, res) => {
  const data = await dashboardService.sourceBreakdown(req.query);
  ApiResponse.ok(res, data, 'Source breakdown');
});

const temperatureBreakdown = asyncHandler(async (req, res) => {
  const data = await dashboardService.temperatureBreakdown(req.query);
  ApiResponse.ok(res, data, 'Temperature breakdown');
});

const negotiationPipeline = asyncHandler(async (req, res) => {
  const data = await dashboardService.negotiationPipeline(req.query);
  ApiResponse.ok(res, data, 'Negotiation pipeline');
});

const finalDeals = asyncHandler(async (req, res) => {
  const data = await dashboardService.finalDeals(req.query);
  ApiResponse.ok(res, data, 'Final deals');
});

const enquiryTrends = asyncHandler(async (req, res) => {
  const data = await dashboardService.enquiryTrends(req.query);
  ApiResponse.ok(res, data, 'Enquiry trends');
});

const enquiryStatusBreakdown = asyncHandler(async (req, res) => {
  const data = await dashboardService.enquiryStatusBreakdown(req.query);
  ApiResponse.ok(res, data, 'Enquiry status breakdown');
});

module.exports = {
  overview,
  stageFunnel,
  salespersonPerformance,
  sourceBreakdown,
  temperatureBreakdown,
  negotiationPipeline,
  finalDeals,
  enquiryTrends,
  enquiryStatusBreakdown,
};
