import { axiosClient } from '../../../../shared/api/axiosClient';

const BASE = '/lead-assignments';

export const leadAssignmentAPI = {
  history(params = {}) {
    return axiosClient.get(BASE, { params });
  },
  autoRun(payload = {}) {
    return axiosClient.post(`${BASE}/auto-run`, payload);
  },
};
