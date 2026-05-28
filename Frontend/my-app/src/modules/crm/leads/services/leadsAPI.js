import { axiosClient } from '../../../../shared/api/axiosClient';

const BASE = '/leads';

export const leadsAPI = {
  list(params = {}) {
    return axiosClient.get(BASE, {
      params,
      paramsSerializer: { indexes: null },
    });
  },
  getById(id) {
    return axiosClient.get(`${BASE}/${id}`);
  },
  history(id) {
    return axiosClient.get(`${BASE}/${id}/history`);
  },
  update(id, payload) {
    return axiosClient.patch(`${BASE}/${id}`, payload);
  },
  moveStage(id, payload) {
    return axiosClient.post(`${BASE}/${id}/move-stage`, payload);
  },
  undoStage(id) {
    return axiosClient.post(`${BASE}/${id}/undo-stage`);
  },
  markWon(id) {
    return axiosClient.post(`${BASE}/${id}/mark-won`);
  },
  markLost(id, reason) {
    return axiosClient.post(`${BASE}/${id}/mark-lost`, { reason });
  },
  markDropped(id, reason) {
    return axiosClient.post(`${BASE}/${id}/mark-dropped`, { reason });
  },
  assignVisit(id, payload) {
    return axiosClient.post(`${BASE}/${id}/assign-visit`, payload);
  },
  unassignVisit(id, payload) {
    return axiosClient.post(`${BASE}/${id}/unassign-visit`, payload);
  },
};
