import { axiosClient } from '../../../../shared/api/axiosClient';

const BASE = '/leads';

export const leadAPI = {
  list(params = {}) {
    return axiosClient.get(BASE, { params });
  },
  getById(id) {
    return axiosClient.get(`${BASE}/${id}`);
  },
  assign(id, payload) {
    return axiosClient.post(`${BASE}/${id}/assign`, payload);
  },
  unassign(id) {
    return axiosClient.post(`${BASE}/${id}/unassign`);
  },
  createFromEnquiry(enquiryId) {
    return axiosClient.post(`${BASE}/from-enquiry/${enquiryId}`);
  },
};
