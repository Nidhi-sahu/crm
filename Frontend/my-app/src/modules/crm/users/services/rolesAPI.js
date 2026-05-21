import { axiosClient } from '../../../../shared/api/axiosClient';

export const rolesAPI = {
  list() {
    return axiosClient.get('/roles');
  },
};
