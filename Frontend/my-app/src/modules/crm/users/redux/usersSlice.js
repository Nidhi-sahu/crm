import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { usersService } from '../services/usersService';
import { extractApiError } from '../../../../shared/api/axiosClient';
import { DEFAULT_PAGE_SIZE } from '../constants/userColumns';

export const fetchUsers = createAsyncThunk(
  'users/fetchList',
  async (params, { rejectWithValue }) => {
    try {
      return await usersService.list(params);
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  },
);

export const fetchUserStats = createAsyncThunk(
  'users/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      return await usersService.getStats();
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  },
);

export const fetchRoles = createAsyncThunk(
  'users/fetchRoles',
  async (_, { rejectWithValue }) => {
    try {
      return await usersService.listRoles();
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  },
);

export const createUser = createAsyncThunk(
  'users/create',
  async (values, { rejectWithValue }) => {
    try {
      return await usersService.create(values);
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  },
);

export const updateUser = createAsyncThunk(
  'users/update',
  async ({ id, values }, { rejectWithValue }) => {
    try {
      return await usersService.update(id, values);
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  },
);

const initialState = {
  items: [],
  pagination: { page: 1, limit: DEFAULT_PAGE_SIZE, total: 0, totalPages: 1 },
  search: '',
  sort: { sortBy: 'createdAt', sortOrder: 'desc' },
  status: 'idle',
  error: null,
  roles: [],
  rolesStatus: 'idle',
  stats: { total: 0, administrators: 0, salesPersons: 0, leadGenerators: 0 },
  statsStatus: 'idle',
  saving: false,
  saveError: null,
};

const slice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setSearch(state, action) {
      state.search = action.payload;
      state.pagination.page = 1;
    },
    setPage(state, action) {
      state.pagination.page = action.payload;
    },
    setSort(state, action) {
      state.sort = action.payload;
      state.pagination.page = 1;
    },
    clearSaveError(state) {
      state.saveError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items;
        state.pagination = { ...state.pagination, ...action.payload.pagination };
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to load users' };
      })

      .addCase(fetchUserStats.pending, (state) => {
        state.statsStatus = 'loading';
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.statsStatus = 'succeeded';
        state.stats = action.payload;
      })
      .addCase(fetchUserStats.rejected, (state) => {
        state.statsStatus = 'failed';
      })

      .addCase(fetchRoles.pending, (state) => {
        state.rolesStatus = 'loading';
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.rolesStatus = 'succeeded';
        state.roles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state) => {
        state.rolesStatus = 'failed';
      });

    [createUser, updateUser].forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.saving = true;
          state.saveError = null;
        })
        .addCase(thunk.fulfilled, (state) => {
          state.saving = false;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.saving = false;
          state.saveError = action.payload || { message: 'Operation failed' };
        });
    });
  },
});

export const { setSearch, setPage, setSort, clearSaveError } = slice.actions;
export default slice.reducer;
