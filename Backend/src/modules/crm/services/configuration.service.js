const configRepo = require('../repositories/configuration.repository');
const ApiError = require('../../../utils/ApiError');

const list = (query = {}) => {
  const filter = {};
  if (query.category) filter.category = query.category;
  return configRepo.findAll(filter);
};

const getByKey = async (key) => {
  const config = await configRepo.findByKey(key);
  if (!config) throw ApiError.notFound(`Configuration not found: ${key}`);
  return config;
};

const set = async (key, body, actor) => {
  const existing = await configRepo.findByKey(key);
  if (existing && existing.isSystem && body.key && body.key !== existing.key) {
    throw ApiError.forbidden('Cannot rename a system configuration key');
  }
  const data = {
    value: body.value,
    category: body.category || (existing && existing.category) || 'general',
    description: body.description !== undefined ? body.description : (existing && existing.description) || '',
    updatedBy: actor._id,
  };
  return configRepo.upsertByKey(key, data);
};

const bulkSet = async (items, actor) => {
  if (!items || !items.length) throw ApiError.badRequest('items array is required');
  await configRepo.bulkUpsert(items, actor);
  const keys = items.map((i) => i.key);
  return configRepo.findAll({ key: { $in: keys } });
};

const remove = async (key) => {
  const existing = await configRepo.findByKey(key);
  if (!existing) throw ApiError.notFound(`Configuration not found: ${key}`);
  if (existing.isSystem) throw ApiError.forbidden('Cannot delete a system configuration');
  await configRepo.remove(key);
};

module.exports = { list, getByKey, set, bulkSet, remove };
