import { enquiryAPI } from './enquiryAPI';

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

export const enquiryService = {
  async list(params = {}) {
    const res = await enquiryAPI.list(cleanParams(params));
    const data = unwrap(res);
    const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
    const pagination =
      meta(res)?.pagination ||
      (data?.total !== undefined
        ? {
            page: data.page || 1,
            limit: data.limit || params.limit || 20,
            total: data.total || 0,
            totalPages: Math.max(1, Math.ceil((data.total || 0) / (data.limit || 20))),
          }
        : { page: 1, limit: params.limit || 20, total: items.length, totalPages: 1 });
    return { items, pagination };
  },

  async getById(id) {
    return unwrap(await enquiryAPI.getById(id));
  },

  async create(payload) {
    return unwrap(await enquiryAPI.create(payload));
  },

  async update(id, payload) {
    return unwrap(await enquiryAPI.update(id, payload));
  },

  async remove(id) {
    return unwrap(await enquiryAPI.remove(id));
  },

  async statusBreakdown(params = {}) {
    const data = unwrap(await enquiryAPI.statusBreakdown(params)) || {};
    return {
      total: Number(data.total) || 0,
      pending: Number(data.pending) || 0,
      qualified: Number(data.qualified) || 0,
      notQualified: Number(data.notQualified) || 0,
    };
  },
};
