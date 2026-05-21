const roleRepo = require('../repositories/role.repository');
const permissionRepo = require('../repositories/permission.repository');
const ApiError = require('../../../utils/ApiError');

const validatePermissionKeys = async (keys) => {
  if (!keys || !keys.length) return;
  const valid = await permissionRepo.findKeys(keys);
  const invalid = keys.filter((k) => !valid.includes(k));
  if (invalid.length) throw ApiError.badRequest(`Unknown permission keys: ${invalid.join(', ')}`);
};

const create = async (data) => {
  const existing = await roleRepo.findByName(data.name);
  if (existing) throw ApiError.conflict('Role name already exists');
  await validatePermissionKeys(data.permissions);
  return roleRepo.create(data);
};

const list = () => roleRepo.findAll();

const getById = async (id) => {
  const role = await roleRepo.findById(id);
  if (!role) throw ApiError.notFound('Role not found');
  return role;
};

const update = async (id, data) => {
  const role = await roleRepo.findById(id);
  if (!role) throw ApiError.notFound('Role not found');
  if (role.isSystem && data.name && data.name !== role.name) {
    throw ApiError.forbidden('Cannot rename a system role');
  }
  if (data.permissions) await validatePermissionKeys(data.permissions);
  return roleRepo.update(id, data);
};

const remove = async (id) => {
  const role = await roleRepo.findById(id);
  if (!role) throw ApiError.notFound('Role not found');
  if (role.isSystem) throw ApiError.forbidden('Cannot delete a system role');
  await roleRepo.remove(id);
};

module.exports = { create, list, getById, update, remove };
