const asyncHandler = require('../../../utils/asyncHandler');
const ApiResponse = require('../../../utils/ApiResponse');
const configurationService = require('../services/configuration.service');

const list = asyncHandler(async (req, res) => {
  const data = await configurationService.list(req.query);
  ApiResponse.ok(res, data, 'Configurations fetched');
});

const getByKey = asyncHandler(async (req, res) => {
  const config = await configurationService.getByKey(req.params.key);
  ApiResponse.ok(res, { config }, 'Configuration fetched');
});

const set = asyncHandler(async (req, res) => {
  const config = await configurationService.set(req.params.key, req.body, req.user);
  ApiResponse.ok(res, { config }, 'Configuration set');
});

const bulkSet = asyncHandler(async (req, res) => {
  const configs = await configurationService.bulkSet(req.body.items, req.user);
  ApiResponse.ok(res, configs, 'Configurations updated');
});

const remove = asyncHandler(async (req, res) => {
  await configurationService.remove(req.params.key);
  ApiResponse.ok(res, null, 'Configuration deleted');
});

module.exports = { list, getByKey, set, bulkSet, remove };
