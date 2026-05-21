import { usersAPI } from './usersAPI';
import { rolesAPI } from './rolesAPI';
import { generateTempPassword } from '../utils/userFormatters';
import { ROLE_NAMES } from '../constants/userRoles';

const unwrap = (res) => res?.data?.data ?? res?.data ?? null;
const meta = (res) => res?.data?.meta ?? null;

const cleanParams = (params = {}) => {
  const out = {};
  Object.entries(params).forEach(([k, v]) => {
    if (v === '' || v === null || v === undefined) return;
    out[k] = v;
  });
  return out;
};

const extractUser = (data) => data?.user ?? data ?? null;

export const usersService = {
  async list(params = {}) {
    const res = await usersAPI.list(cleanParams(params));
    const data = unwrap(res);
    const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
    const pagination =
      meta(res)?.pagination ||
      (data?.total !== undefined
        ? {
            page: data.page || 1,
            limit: data.limit || params.limit || 10,
            total: data.total || 0,
            totalPages: Math.max(1, Math.ceil((data.total || 0) / (data.limit || 10))),
          }
        : { page: 1, limit: params.limit || 10, total: items.length, totalPages: 1 });
    return { items, pagination };
  },

  async listRoles() {
    const data = unwrap(await rolesAPI.list());
    const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
    return items;
  },

  async getStats() {
    const res = await usersAPI.list({ limit: 100 });
    const data = unwrap(res);
    const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
    const total = meta(res)?.pagination?.total ?? items.length;

    const userHasRole = (u, name) => {
      const primary = u.roleId?.name || u.role?.name;
      if (primary === name) return true;
      return (u.additionalRoleIds || []).some((r) => (r?.name || r) === name);
    };
    const countByRole = (name) => items.filter((u) => userHasRole(u, name)).length;

    return {
      total,
      administrators: countByRole(ROLE_NAMES.ADMINISTRATOR),
      salesPersons: countByRole(ROLE_NAMES.SALES_PERSON),
      leadGenerators: countByRole(ROLE_NAMES.LEAD_GENERATOR),
    };
  },

  async create(values) {
    const tempPassword = generateTempPassword();
    const roleIds = [...new Set((values.roleIds || []).filter(Boolean))];
    const payload = {
      name: values.name.trim(),
      email: values.email.trim(),
      roleId: roleIds[0],
      additionalRoleIds: roleIds.slice(1),
      password: tempPassword,
    };
    if (values.phone?.trim()) payload.phone = values.phone.trim();
    const user = extractUser(unwrap(await usersAPI.create(payload)));
    return { user, tempPassword };
  },

  async update(id, values) {
    const roleIds = [...new Set((values.roleIds || []).filter(Boolean))];
    const payload = {
      name: values.name.trim(),
      email: values.email.trim(),
      roleId: roleIds[0],
      additionalRoleIds: roleIds.slice(1),
      phone: values.phone?.trim() || '',
    };
    return extractUser(unwrap(await usersAPI.update(id, payload)));
  },
};
