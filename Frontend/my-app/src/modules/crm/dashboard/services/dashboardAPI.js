import { axiosClient } from '../../../../shared/api/axiosClient';
import { DASHBOARD_ENDPOINTS, ENQUIRY_TRENDS_DAYS } from '../constants/dashboardConfig';

export const dashboardAPI = {
  overview(params = {}) {
    return axiosClient.get(DASHBOARD_ENDPOINTS.overview, { params });
  },
  sourceBreakdown(params = {}) {
    return axiosClient.get(DASHBOARD_ENDPOINTS.sourceBreakdown, { params });
  },
  salespersonPerformance(params = {}) {
    return axiosClient.get(DASHBOARD_ENDPOINTS.salespersonPerformance, { params });
  },
  enquiryTrends(params = {}) {
    return axiosClient.get(DASHBOARD_ENDPOINTS.enquiryTrends, {
      params: { days: ENQUIRY_TRENDS_DAYS, ...params },
    });
  },
  conversionFunnel(params = {}) {
    return axiosClient.get(DASHBOARD_ENDPOINTS.conversionFunnel, { params });
  },
};
