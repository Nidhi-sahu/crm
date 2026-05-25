import { axiosClient } from '../../../../shared/api/axiosClient';

const BASE = '/permissions';

export const permissionsAPI = {
  list() {
    return axiosClient.get(BASE);
  },
};
