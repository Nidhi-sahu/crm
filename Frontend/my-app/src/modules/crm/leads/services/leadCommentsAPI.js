import { axiosClient } from '../../../../shared/api/axiosClient';

export const leadCommentsAPI = {
  listByLead(leadId) {
    return axiosClient.get(`/comments/by-ref/lead/${leadId}`);
  },
  create(payload) {
    return axiosClient.post('/comments', payload);
  },
};
