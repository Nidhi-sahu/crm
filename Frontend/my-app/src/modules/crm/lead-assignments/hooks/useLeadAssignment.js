import { useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchLeads,
  fetchAssignmentHistory,
  fetchSalesPersons,
  fetchWorkload,
  assignLead,
  runAutoAssign,
  setSearch,
  setPage,
  clearSaveError,
} from '../redux/leadAssignmentSlice';

export function useLeadAssignment() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.leadAssignments);
  const debounceRef = useRef(null);

  const params = useMemo(() => {
    const p = {
      page: state.pagination.page,
      limit: state.pagination.limit,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
    if (state.filters.search) p.search = state.filters.search;
    return p;
  }, [state.pagination.page, state.pagination.limit, state.filters.search]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      dispatch(fetchLeads(params));
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [dispatch, params]);

  useEffect(() => {
    dispatch(fetchAssignmentHistory());
    dispatch(fetchSalesPersons());
    dispatch(fetchWorkload());
  }, [dispatch]);

  const reload = () => {
    dispatch(fetchLeads(params));
    dispatch(fetchAssignmentHistory());
    dispatch(fetchWorkload());
  };

  const submitAssign = (leadId, assignedTo, reason) =>
    dispatch(assignLead({ leadId, assignedTo, reason })).unwrap();

  const triggerAutoRun = () => dispatch(runAutoAssign()).unwrap();

  const totals = useMemo(() => {
    const totalActive = state.leads.items.filter((l) => l.status === 'active').length;
    const pending = state.leads.items.filter((l) => !l.assignedTo).length;
    return {
      pending,
      totalActive,
      totalSalesPersons: state.salesPersons.items.length,
    };
  }, [state.leads.items, state.salesPersons.items]);

  return {
    leads: state.leads.items,
    leadsStatus: state.leads.status,
    leadsError: state.leads.error,
    isLoading: state.leads.status === 'loading' || state.leads.status === 'idle',
    isError: state.leads.status === 'failed',
    isEmpty: state.leads.status === 'succeeded' && state.leads.items.length === 0,
    pagination: state.pagination,
    filters: state.filters,
    latestByLead: state.history.latestByLead,
    salesPersons: state.salesPersons.items,
    salesPersonsLoading: state.salesPersons.status === 'loading',
    workload: state.workload.items,
    saving: state.saving,
    saveError: state.saveError,
    autoRunning: state.autoRunning,
    autoRunError: state.autoRunError,
    totals,
    setSearch: (s) => dispatch(setSearch(s)),
    setPage: (p) => dispatch(setPage(p)),
    clearSaveError: () => dispatch(clearSaveError()),
    submitAssign,
    triggerAutoRun,
    reload,
  };
}
