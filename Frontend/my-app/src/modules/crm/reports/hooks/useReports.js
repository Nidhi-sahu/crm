import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { generateReport, setFilter, setAppliedRange } from '../redux/reportSlice';
import { resolvePreset } from '../constants/dateRanges';

export function useReports() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.reports);

  const run = () => {
    const { preset, customFrom, customTo, reportType, salespersonId } = state.filters;
    const { from, to } = resolvePreset(preset, { from: customFrom, to: customTo });
    dispatch(setAppliedRange({ from, to }));
    const params = { from, to };
    if (reportType === 'salesPerson' && salespersonId) {
      params.salespersonId = salespersonId;
    }
    dispatch(generateReport(params));
  };

  // Auto-generate once on first mount
  useEffect(() => {
    if (state.status === 'idle') run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    filters: state.filters,
    appliedRange: state.appliedRange,
    data: state.data,
    status: state.status,
    error: state.error,
    isLoading: state.status === 'loading',
    isError: state.status === 'failed',
    setFilter: (patch) => dispatch(setFilter(patch)),
    generate: run,
  };
}
