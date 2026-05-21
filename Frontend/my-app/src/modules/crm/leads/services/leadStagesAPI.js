import { axiosClient } from '../../../../shared/api/axiosClient';

export const leadStagesAPI = {
  list() {
    return axiosClient.get('/lead-stages', { params: { limit: 100, isActive: true } });
  },
};
