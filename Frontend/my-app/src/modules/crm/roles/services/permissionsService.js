import { permissionsAPI } from './permissionsAPI';

const unwrap = (res) => res?.data?.data ?? res?.data ?? null;

export const permissionsService = {
  async list() {
    const data = unwrap(await permissionsAPI.list());
    const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
    return items;
  },
};
