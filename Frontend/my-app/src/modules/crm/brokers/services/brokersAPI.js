import { axiosClient } from '../../../../shared/api/axiosClient';

const BASE = '/brokers';

export const brokersAPI = {
  list() {
    return axiosClient.get(BASE);
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
  stats(id) {
    return axiosClient.get(`${BASE}/${id}/stats`);
  },
  leads(id) {
    return axiosClient.get(`${BASE}/${id}/leads`);
  },
};
