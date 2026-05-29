import { axiosClient } from '../../../../shared/api/axiosClient';
import { API_ROUTES } from '../../../../shared/constants/apiRoutes';

export const authAPI = {
  login(payload) {
    return axiosClient.post(API_ROUTES.auth.login, payload);
  },
  googleLogin(payload) {
    return axiosClient.post(API_ROUTES.auth.google, payload);
  },
  refresh() {
    return axiosClient.post(API_ROUTES.auth.refresh, {});
  },
  logout() {
    return axiosClient.post(API_ROUTES.auth.logout, {});
  },
  logoutAll() {
    return axiosClient.post(API_ROUTES.auth.logoutAll, {});
  },
  me() {
    return axiosClient.get(API_ROUTES.auth.me);
  },
  forgotPassword(payload) {
    return axiosClient.post(API_ROUTES.auth.forgotPassword, payload);
  },
  resetPassword(payload) {
    return axiosClient.post(API_ROUTES.auth.resetPassword, payload);
  },
  changePassword(payload) {
    return axiosClient.post(API_ROUTES.auth.changePassword, payload);
  },
};
