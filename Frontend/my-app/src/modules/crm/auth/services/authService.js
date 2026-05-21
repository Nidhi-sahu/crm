import { authAPI } from './authAPI';
import { tokenStorage } from '../../../../shared/utils/tokenStorage';

const unwrap = (res) => res?.data?.data ?? res?.data ?? {};

export const authService = {
  async login({ email, password, rememberMe }) {
    tokenStorage.setRemember(!!rememberMe);
    const res = await authAPI.login({ email, password });
    const data = unwrap(res);
    const accessToken = data.accessToken || data.tokens?.accessToken;
    const user = data.user || data;
    if (accessToken) tokenStorage.setAccessToken(accessToken);
    return { accessToken, user };
  },

  async me() {
    const res = await authAPI.me();
    return unwrap(res);
  },

  async logout() {
    try {
      await authAPI.logout();
    } catch (_) {
      // best-effort — clear locally regardless
    } finally {
      tokenStorage.clear();
    }
  },
};
