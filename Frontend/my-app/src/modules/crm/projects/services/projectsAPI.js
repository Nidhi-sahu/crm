import { axiosClient } from '../../../../shared/api/axiosClient';

const BASE = '/projects';

export const projectsAPI = {
  list(params = {}) {
    return axiosClient.get(BASE, { params });
  },
  create(payload) {
    return axiosClient.post(BASE, payload);
  },
  update(id, payload) {
    return axiosClient.patch(`${BASE}/${id}`, payload);
  },
  remove(id) {
    return axiosClient.delete(`${BASE}/${id}`);
  },
};
