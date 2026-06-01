import { brokersAPI } from './brokersAPI';

const unwrap = (res) => res?.data?.data ?? res?.data ?? null;

export const brokersService = {
  async list() {
    const data = unwrap(await brokersAPI.list());
    return Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
  },
  async getById(id) {
    const data = unwrap(await brokersAPI.getById(id));
    return data?.broker ?? data ?? null;
  },
  async create(payload) {
    return unwrap(await brokersAPI.create(payload));
  },
  async update(id, payload) {
    const data = unwrap(await brokersAPI.update(id, payload));
    return data?.broker ?? data ?? null;
  },
  async stats(id) {
    return unwrap(await brokersAPI.stats(id));
  },
  async leads(id) {
    const data = unwrap(await brokersAPI.leads(id));
    return Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
  },
};
