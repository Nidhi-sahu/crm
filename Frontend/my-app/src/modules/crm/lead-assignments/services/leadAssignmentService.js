import { leadAPI } from './leadAPI';
import { leadAssignmentAPI } from './leadAssignmentAPI';
import { salespersonAPI } from './salespersonAPI';
import { axiosClient } from '../../../../shared/api/axiosClient';

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

export const leadAssignmentService = {
  async fetchLeads(params = {}) {
    const res = await leadAPI.list(cleanParams({ status: 'active', ...params }));
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

  async fetchAssignmentHistory(params = {}) {
    const res = await leadAssignmentAPI.history({ limit: 200, ...params });
    const data = unwrap(res);
    const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
    return items;
  },

  fetchSalesPersons: salespersonAPI.fetchSalesPersons,
  fetchWorkload: salespersonAPI.fetchWorkload,

  async getEnquiry(enquiryId) {
    try {
      const res = await axiosClient.get(`/enquiries/${enquiryId}`);
      const data = unwrap(res);
      return data?.enquiry || data || null;
    } catch (_) {
      return null;
    }
  },

  async getQualification(enquiryId) {
    try {
      const res = await axiosClient.get(`/qualifications/by-enquiry/${enquiryId}`);
      const data = unwrap(res);
      return data?.qualification || data || null;
    } catch (_) {
      return null;
    }
  },

  async assign(leadId, assignedTo, reason) {
    const res = await leadAPI.assign(leadId, { assignedTo, reason });
    return unwrap(res);
  },

  async autoRun() {
    const res = await leadAssignmentAPI.autoRun({});
    return unwrap(res);
  },
};

export const buildLatestAssignmentMap = (assignments = []) => {
  const map = {};
  assignments.forEach((a) => {
    if (!a?.leadId) return;
    const id = a.leadId?._id || a.leadId;
    const existing = map[id];
    if (!existing || new Date(a.createdAt).getTime() > new Date(existing.createdAt).getTime()) {
      map[id] = a;
    }
  });
  return map;
};
