import { rolesAPI } from './rolesAPI';

const unwrap = (res) => res?.data?.data ?? res?.data ?? null;

export const rolesService = {
  async list() {
    const data = unwrap(await rolesAPI.list());
    const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
    return items;
  },
  async getById(id) {
    const data = unwrap(await rolesAPI.getById(id));
    return data?.role ?? data ?? null;
  },
  async update(id, payload) {
    const data = unwrap(await rolesAPI.update(id, payload));
    return data?.role ?? data ?? null;
  },
};
