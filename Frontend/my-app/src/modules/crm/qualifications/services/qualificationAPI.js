import { axiosClient } from '../../../../shared/api/axiosClient';

const BASE = '/qualifications';

export const qualificationAPI = {
  getByEnquiry(enquiryId) {
    return axiosClient.get(`${BASE}/by-enquiry/${enquiryId}`);
  },
  create(payload) {
    return axiosClient.post(BASE, payload);
  },
  update(id, payload) {
    return axiosClient.patch(`${BASE}/${id}`, payload);
  },
  qualify(id) {
    return axiosClient.post(`${BASE}/${id}/qualify`);
  },
  reject(id, reason) {
    return axiosClient.post(`${BASE}/${id}/reject`, { reason });
  },
  hold(id, payload) {
    return axiosClient.post(`${BASE}/${id}/hold`, payload);
  },
  futureProspect(id) {
    return axiosClient.post(`${BASE}/${id}/future-prospect`);
  },
};
