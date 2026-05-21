import { axiosClient } from '../../../../shared/api/axiosClient';

export const reportAPI = {
  conversionFunnel(params = {}) {
    return axiosClient.get('/reports/conversion-funnel', { params });
  },
  stageDelay(params = {}) {
    return axiosClient.get('/reports/stage-delay', { params });
  },
  salespersonScorecard(params = {}) {
    return axiosClient.get('/reports/salesperson-scorecard', { params });
  },
  avgCompletionTime(params = {}) {
    return axiosClient.get('/reports/avg-completion-time', { params });
  },
  stageFunnel(params = {}) {
    return axiosClient.get('/dashboard/stage-funnel', { params });
  },
};
