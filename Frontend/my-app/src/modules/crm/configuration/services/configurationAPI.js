import { axiosClient } from '../../../../shared/api/axiosClient';

const BASE = '/lead-stages';

export const configurationAPI = {
  listStages() {
    return axiosClient.get(BASE);
  },
  bulkSave(steps) {
    return axiosClient.put(`${BASE}/bulk`, { steps });
  },
};
