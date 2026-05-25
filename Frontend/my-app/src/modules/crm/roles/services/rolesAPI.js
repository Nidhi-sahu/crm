import { axiosClient } from '../../../../shared/api/axiosClient';

const BASE = '/roles';

export const rolesAPI = {
  list(params = {}) {
    return axiosClient.get(BASE, { params });
  },
  getById(id) {
    return axiosClient.get(`${BASE}/${id}`);
  },
  update(id, payload) {
    return axiosClient.patch(`${BASE}/${id}`, payload);
  },
};
