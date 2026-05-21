import { useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUsers,
  fetchUserStats,
  fetchRoles,
  createUser,
  updateUser,
  setSearch,
  setPage,
  setSort,
  clearSaveError,
} from '../redux/usersSlice';

export function useUsers() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.users);
  const debounceRef = useRef(null);

  const params = useMemo(
    () => ({
      page: state.pagination.page,
      limit: state.pagination.limit,
      sortBy: state.sort.sortBy,
      sortOrder: state.sort.sortOrder,
      search: state.search || undefined,
    }),
    [state.pagination.page, state.pagination.limit, state.sort, state.search],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      dispatch(fetchUsers(params));
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [dispatch, params]);

  useEffect(() => {
    if (state.rolesStatus === 'idle') dispatch(fetchRoles());
    if (state.statsStatus === 'idle') dispatch(fetchUserStats());
  }, [dispatch, state.rolesStatus, state.statsStatus]);

  const refreshAll = () => {
    dispatch(fetchUsers(params));
    dispatch(fetchUserStats());
  };

  return {
    items: state.items,
    pagination: state.pagination,
    search: state.search,
    sort: state.sort,
    status: state.status,
    error: state.error,
    roles: state.roles,
    rolesStatus: state.rolesStatus,
    stats: state.stats,
    statsStatus: state.statsStatus,
    saving: state.saving,
    saveError: state.saveError,
    isLoading: state.status === 'loading' || state.status === 'idle',
    isError: state.status === 'failed',
    isEmpty: state.status === 'succeeded' && state.items.length === 0,
    setSearch: (v) => dispatch(setSearch(v)),
    setPage: (p) => dispatch(setPage(p)),
    setSort: (next) => dispatch(setSort(next)),
    clearSaveError: () => dispatch(clearSaveError()),
    create: (values) => dispatch(createUser(values)).unwrap(),
    update: (id, values) => dispatch(updateUser({ id, values })).unwrap(),
    refreshAll,
  };
}
