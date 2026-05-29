import { axiosClient } from '../../../../shared/api/axiosClient';

const BASE = '/enquiries';

export const enquiryAPI = {
  list(params = {}) {
    return axiosClient.get(BASE, {
      params,
      paramsSerializer: {
        indexes: null,
      },
    });
  },
  statusBreakdown(params = {}) {
    return axiosClient.get('/dashboard/enquiry-status-breakdown', { params });
  },
  getById(id) {
    return axiosClient.get(`${BASE}/${id}`);
  },
  create(payload) {
    return axiosClient.post(BASE, payload);
  },
  update(id, payload) {
    return axiosClient.patch(`${BASE}/${id}`, payload);
  },
  setFollowup(id, payload) {
    return axiosClient.post(`${BASE}/${id}/followup`, payload);
  },
  remove(id) {
    return axiosClient.delete(`${BASE}/${id}`);
  },
  checkPhone(phone, excludeId) {
    return axiosClient.get(`${BASE}/check-phone`, { params: { phone, excludeId } });
  },
  bulkImport(payload) {
    return axiosClient.post(`${BASE}/bulk-import`, payload);
  },
  bulkAssign(payload) {
    return axiosClient.post(`${BASE}/bulk-assign`, payload);
  },
};
