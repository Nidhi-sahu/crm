import axios from 'axios';
import { tokenStorage } from '../utils/tokenStorage';
import { API_ROUTES } from '../constants/apiRoutes';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1/crm';

export const axiosClient = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 20000,
});

axiosClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshInFlight = null;
let onAuthFailure = null;

export const registerAuthFailureHandler = (fn) => {
  onAuthFailure = fn;
};

const refreshAccessToken = async () => {
  if (!refreshInFlight) {
    refreshInFlight = axios
      .post(
        `${baseURL}${API_ROUTES.auth.refresh}`,
        {},
        { withCredentials: true, timeout: 15000 },
      )
      .then((res) => {
        const newToken = res?.data?.data?.accessToken;
        if (!newToken) throw new Error('No access token in refresh response');
        tokenStorage.setAccessToken(newToken);
        return newToken;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config || {};
    const status = error.response?.status;
    const url = original.url || '';

    const isAuthEndpoint =
      url.endsWith(API_ROUTES.auth.login) ||
      url.endsWith(API_ROUTES.auth.refresh) ||
      url.endsWith(API_ROUTES.auth.forgotPassword) ||
      url.endsWith(API_ROUTES.auth.resetPassword);

    if (status === 401 && !original._retry && !isAuthEndpoint) {
      original._retry = true;
      try {
        const newToken = await refreshAccessToken();
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return axiosClient(original);
      } catch (refreshErr) {
        tokenStorage.clear();
        if (typeof onAuthFailure === 'function') onAuthFailure();
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  },
);

export const extractApiError = (error) => {
  const data = error?.response?.data;
  if (data?.message) {
    return {
      message: data.message,
      code: data.code,
      details: data.details || [],
    };
  }
  return {
    message: error?.message || 'Network error. Please try again.',
    code: 'NETWORK_ERROR',
    details: [],
  };
};
