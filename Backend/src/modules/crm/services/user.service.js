const userRepo = require('../repositories/user.repository');
const roleRepo = require('../repositories/role.repository');
const permissionRepo = require('../repositories/permission.repository');
const auditLogService = require('./auditLog.service');
const hashUtil = require('../../../utils/hash.util');
const ApiError = require('../../../utils/ApiError');
const { buildSkip } = require('../../../utils/pagination');

const sanitize = (u) => {
  if (!u) return u;
  const { passwordHash, passwordResetToken, passwordResetExpires, ...rest } = u;
  return rest;
};

const audit = (action, actor, refId, oldData, newData) =>
  auditLogService.log({
    module: 'user',
    action,
    actor,
    refType: 'user',
    refId,
    oldData: oldData ? sanitize(oldData) : null,
    newData: newData ? sanitize(newData) : null,
  });

const validatePermissionKeys = async (keys) => {
  if (!keys || !keys.length) return;
  const valid = await permissionRepo.findKeys(keys);
  const invalid = keys.filter((k) => !valid.includes(k));
  if (invalid.length) throw ApiError.badRequest(`Unknown permission keys: ${invalid.join(', ')}`);
};

const create = async (data, actor) => {
  const existing = await userRepo.findByEmailLean(data.email);
  if (existing) throw ApiError.conflict('Email already in use');

  const role = await roleRepo.findById(data.roleId);
  if (!role) throw ApiError.badRequest('Invalid roleId');

  await validatePermissionKeys(data.additionalPermissions);

  if (data.managerId) {
    const manager = await userRepo.findById(data.managerId);
    if (!manager) throw ApiError.badRequest('Invalid managerId');
  }

  const passwordHash = await hashUtil.hash(data.password);
  const created = await userRepo.create({
    name: data.name,
    email: data.email,
    phone: data.phone || '',
    passwordHash,
    roleId: data.roleId,
    additionalRoleIds: data.additionalRoleIds || [],
    additionalPermissions: data.additionalPermissions || [],
    managerId: data.managerId || null,
    status: data.status || 'active',
  });
  const json = created.toJSON();
  audit('create', actor, created._id, null, json);
  return json;
};

const list = async (query) => {
  const { page = 1, limit = 20, search, status, roleId, sortBy = 'createdAt', sortOrder = 'desc' } = query;
  const filter = {};
  if (status) filter.status = status;
  if (roleId) filter.roleId = roleId;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = buildSkip({ page, limit });
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [items, total] = await Promise.all([
    userRepo.findAll({ filter, sort, skip, limit: Number(limit) }),
    userRepo.countAll(filter),
  ]);

  return { items, total, page: Number(page), limit: Number(limit) };
};

const getById = async (id) => {
  const user = await userRepo.findById(id);
  if (!user) throw ApiError.notFound('User not found');
  return user;
};

const update = async (id, data, actor) => {
  if (data.email) {
    const existing = await userRepo.findByEmailLean(data.email);
    if (existing && String(existing._id) !== String(id)) {
      throw ApiError.conflict('Email already in use');
    }
  }
  if (data.roleId) {
    const role = await roleRepo.findById(data.roleId);
    if (!role) throw ApiError.badRequest('Invalid roleId');
  }
  if (data.additionalPermissions) {
    await validatePermissionKeys(data.additionalPermissions);
  }
  if (data.managerId) {
    if (String(data.managerId) === String(id)) {
      throw ApiError.badRequest('User cannot be their own manager');
    }
    const manager = await userRepo.findById(data.managerId);
    if (!manager) throw ApiError.badRequest('Invalid managerId');
  }

  delete data.password;
  delete data.passwordHash;

  const before = await userRepo.findById(id);
  if (!before) throw ApiError.notFound('User not found');
  const user = await userRepo.update(id, data);
  audit('update', actor, id, before, user);
  return user;
};

const setStatus = async (id, status, actor) => {
  const before = await userRepo.findById(id);
  if (!before) throw ApiError.notFound('User not found');
  const user = await userRepo.update(id, { status });
  audit('setStatus', actor, id, { status: before.status }, { status });
  return user;
};

const assignRole = async (id, roleId, actor) => {
  const role = await roleRepo.findById(roleId);
  if (!role) throw ApiError.badRequest('Invalid roleId');
  const before = await userRepo.findById(id);
  if (!before) throw ApiError.notFound('User not found');
  const user = await userRepo.update(id, { roleId });
  audit('assignRole', actor, id, { roleId: before.roleId }, { roleId });
  return user;
};

const remove = async (id, actor) => {
  const before = await userRepo.findById(id);
  if (!before) throw ApiError.notFound('User not found');
  await userRepo.remove(id);
  audit('delete', actor, id, before, null);
};

module.exports = { create, list, getById, update, setStatus, assignRole, remove };
