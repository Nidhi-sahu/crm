import { axiosClient } from '../../../../shared/api/axiosClient';

const BASE = '/users';

export const usersAPI = {
  list(params = {}) {
    return axiosClient.get(BASE, { params });
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
};
