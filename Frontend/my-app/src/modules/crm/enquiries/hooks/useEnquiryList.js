import { useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchEnquiries,
  fetchEnquiryKpis,
  createEnquiry,
  updateEnquiry,
  setFilter,
  resetFilters,
  setPage,
  setSort,
  clearSaveError,
} from '../redux/enquirySlice';
import { uiStatusToBackend } from '../constants/enquiryStatuses';

export function useEnquiryList() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.enquiries);
  const debounceRef = useRef(null);

  const params = useMemo(() => {
    const p = {
      page: state.pagination.page,
      limit: state.pagination.limit,
      sortBy: state.sort.sortBy,
      sortOrder: state.sort.sortOrder,
    };
    if (state.filters.search) p.search = state.filters.search;
    if (state.filters.uiStatus === 'todaysFollowup') {
      p.followupToday = true;
    } else if (state.filters.uiStatus) {
      const backend = uiStatusToBackend(state.filters.uiStatus);
      if (backend) p.status = backend;
    }
    if (state.filters.activityDate) p.activityDate = state.filters.activityDate;
    return p;
  }, [state.pagination.page, state.pagination.limit, state.sort, state.filters]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      dispatch(fetchEnquiries(params));
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [dispatch, params]);

  useEffect(() => {
    dispatch(fetchEnquiryKpis());
  }, [dispatch]);

  const create = (payload) => dispatch(createEnquiry(payload)).unwrap();
  const update = (id, payload) => dispatch(updateEnquiry({ id, payload })).unwrap();

  return {
    items: state.items,
    pagination: state.pagination,
    filters: state.filters,
    sort: state.sort,
    status: state.status,
    error: state.error,
    saving: state.saving,
    saveError: state.saveError,
    kpis: state.kpis,
    kpisStatus: state.kpisStatus,
    isLoading: state.status === 'loading' || state.status === 'idle',
    isError: state.status === 'failed',
    isEmpty: state.status === 'succeeded' && state.items.length === 0,
    setFilter: (patch) => dispatch(setFilter(patch)),
    resetFilters: () => dispatch(resetFilters()),
    setPage: (page) => dispatch(setPage(page)),
    setSort: (next) => dispatch(setSort(next)),
    clearSaveError: () => dispatch(clearSaveError()),
    create,
    update,
    reload: () => {
      dispatch(fetchEnquiries(params));
      dispatch(fetchEnquiryKpis());
    },
  };
}
