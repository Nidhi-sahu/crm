import { useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchLeads,
  fetchStages,
  fetchLeadHistory,
  fetchLeadComments,
  addLeadComment,
  updateLead,
  moveLeadStage,
  undoLeadStage,
  markLeadWon,
  dropLead,
  setFilter,
  resetFilters,
  setPage,
  clearSaveError,
  resetDrawerState,
} from '../redux/leadsSlice';

export function useLeads() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.leads);
  const debounceRef = useRef(null);

  const params = useMemo(() => {
    const p = {
      page: state.pagination.page,
      limit: state.pagination.limit,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
    if (state.filters.search) p.search = state.filters.search;
    if (state.filters.uiStatus) p.uiStatus = state.filters.uiStatus;
    if (state.filters.stageId) p.currentStageId = state.filters.stageId;
    return p;
  }, [
    state.pagination.page,
    state.pagination.limit,
    state.filters.search,
    state.filters.uiStatus,
    state.filters.stageId,
  ]);

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
    if (state.stagesStatus === 'idle') {
      dispatch(fetchStages());
    }
  }, [dispatch, state.stagesStatus]);

  const totals = useMemo(() => {
    const totals = { total: 0, active: 0, converted: 0, dropped: 0 };
    state.items.forEach((l) => {
      totals.total += 1;
      if (l.status === 'active') totals.active += 1;
      else if (l.status === 'won') totals.converted += 1;
      else totals.dropped += 1;
    });
    return totals;
  }, [state.items]);

  return {
    items: state.items,
    pagination: state.pagination,
    filters: state.filters,
    status: state.status,
    error: state.error,
    stages: state.stages,
    history: state.history,
    comments: state.comments,
    saving: state.saving,
    saveError: state.saveError,
    isLoading: state.status === 'loading' || state.status === 'idle',
    isError: state.status === 'failed',
    isEmpty: state.status === 'succeeded' && state.items.length === 0,
    totals,
    setFilter: (patch) => dispatch(setFilter(patch)),
    resetFilters: () => dispatch(resetFilters()),
    setPage: (p) => dispatch(setPage(p)),
    clearSaveError: () => dispatch(clearSaveError()),
    resetDrawerState: () => dispatch(resetDrawerState()),
    loadHistory: (leadId) => dispatch(fetchLeadHistory(leadId)),
    loadComments: (leadId) => dispatch(fetchLeadComments(leadId)),
    addComment: (input) => dispatch(addLeadComment(input)).unwrap(),
    update: (leadId, payload) => dispatch(updateLead({ leadId, payload })).unwrap(),
    moveStage: (leadId, toStageId) => dispatch(moveLeadStage({ leadId, toStageId })).unwrap(),
    undoStage: (leadId) => dispatch(undoLeadStage(leadId)).unwrap(),
    markWon: (leadId) => dispatch(markLeadWon(leadId)).unwrap(),
    drop: (leadId, reason) => dispatch(dropLead({ leadId, reason })).unwrap(),
    reload: () => dispatch(fetchLeads(params)),
  };
}
