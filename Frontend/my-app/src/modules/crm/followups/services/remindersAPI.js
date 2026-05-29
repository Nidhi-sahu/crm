import { axiosClient } from '../../../../shared/api/axiosClient';

const BASE = '/reminders';

export const remindersAPI = {
  list(params = {}) {
    return axiosClient.get(BASE, { params });
  },
  complete(id) {
    return axiosClient.post(`${BASE}/${id}/complete`);
  },
};
