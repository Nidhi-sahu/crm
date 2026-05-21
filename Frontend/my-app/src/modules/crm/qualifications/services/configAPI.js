import { axiosClient } from '../../../../shared/api/axiosClient';

export const configAPI = {
  get(key) {
    return axiosClient.get(`/configurations/${encodeURIComponent(key)}`);
  },
};
