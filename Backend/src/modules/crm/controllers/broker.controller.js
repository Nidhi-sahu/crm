const asyncHandler = require('../../../utils/asyncHandler');
const ApiResponse = require('../../../utils/ApiResponse');
const brokerService = require('../services/broker.service');

const list = asyncHandler(async (req, res) => {
  const items = await brokerService.list(req.user);
  ApiResponse.ok(res, items, 'Brokers fetched');
});

const create = asyncHandler(async (req, res) => {
  const result = await brokerService.create(req.body, req.user);
  ApiResponse.created(res, result, 'Broker created');
});

const getOne = asyncHandler(async (req, res) => {
  const broker = await brokerService.getById(req.params.id, req.user);
  ApiResponse.ok(res, { broker }, 'Broker fetched');
});

const update = asyncHandler(async (req, res) => {
  const broker = await brokerService.update(req.params.id, req.body, req.user);
  ApiResponse.ok(res, { broker }, 'Broker updated');
});

const stats = asyncHandler(async (req, res) => {
  const data = await brokerService.stats(req.params.id, req.user);
  ApiResponse.ok(res, data, 'Broker stats fetched');
});

const listLeads = asyncHandler(async (req, res) => {
  const items = await brokerService.listLeads(req.params.id, req.user);
  ApiResponse.ok(res, items, 'Broker leads fetched');
});

module.exports = { list, create, getOne, update, stats, listLeads };
