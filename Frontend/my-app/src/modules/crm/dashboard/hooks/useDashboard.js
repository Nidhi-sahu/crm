import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchOverview,
  fetchSourceBreakdown,
  fetchSalespersonPerformance,
  fetchConversionFunnel,
} from '../redux/dashboardSlice';

export function useDashboard(filters = {}) {
  const dispatch = useDispatch();
  const dashboard = useSelector((s) => s.dashboard);

  const loadAll = useCallback(() => {
    dispatch(fetchOverview(filters));
    dispatch(fetchSourceBreakdown(filters));
    dispatch(fetchSalespersonPerformance(filters));
    dispatch(fetchConversionFunnel(filters));
  }, [dispatch, JSON.stringify(filters)]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return {
    overview: dashboard.overview,
    sourceBreakdown: dashboard.sourceBreakdown,
    salespersonPerformance: dashboard.salespersonPerformance,
    conversionFunnel: dashboard.conversionFunnel,
    reload: loadAll,
    reloadOverview: () => dispatch(fetchOverview(filters)),
    reloadSourceBreakdown: () => dispatch(fetchSourceBreakdown(filters)),
    reloadSalespersonPerformance: () => dispatch(fetchSalespersonPerformance(filters)),
    reloadConversionFunnel: () => dispatch(fetchConversionFunnel(filters)),
  };
}
