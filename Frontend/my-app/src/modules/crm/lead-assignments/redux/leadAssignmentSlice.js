import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  leadAssignmentService,
  buildLatestAssignmentMap,
} from '../services/leadAssignmentService';
import { extractApiError } from '../../../../shared/api/axiosClient';
import { DEFAULT_PAGE_SIZE } from '../constants/assignmentColumns';

export const fetchLeads = createAsyncThunk(
  'leadAssignments/fetchLeads',
  async (params, { rejectWithValue }) => {
    try {
      return await leadAssignmentService.fetchLeads(params);
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  },
);

export const fetchAssignmentHistory = createAsyncThunk(
  'leadAssignments/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      return await leadAssignmentService.fetchAssignmentHistory();
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  },
);

export const fetchSalesPersons = createAsyncThunk(
  'leadAssignments/fetchSalesPersons',
  async (_, { rejectWithValue }) => {
    try {
      return await leadAssignmentService.fetchSalesPersons();
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  },
);

export const fetchWorkload = createAsyncThunk(
  'leadAssignments/fetchWorkload',
  async (_, { rejectWithValue }) => {
    try {
      return await leadAssignmentService.fetchWorkload();
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  },
);

export const assignLead = createAsyncThunk(
  'leadAssignments/assign',
  async ({ leadId, assignedTo, reason }, { rejectWithValue }) => {
    try {
      const data = await leadAssignmentService.assign(leadId, assignedTo, reason);
      return { leadId, data };
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  },
);

export const runAutoAssign = createAsyncThunk(
  'leadAssignments/autoRun',
  async (_, { rejectWithValue }) => {
    try {
      return await leadAssignmentService.autoRun();
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  },
);

const initialState = {
  leads: { items: [], status: 'idle', error: null },
  pagination: { page: 1, limit: DEFAULT_PAGE_SIZE, total: 0, totalPages: 1 },
  filters: { search: '' },
  history: { items: [], latestByLead: {}, status: 'idle' },
  salesPersons: { items: [], status: 'idle' },
  workload: { items: [], status: 'idle' },
  saving: false,
  saveError: null,
  autoRunning: false,
  autoRunError: null,
};

const slice = createSlice({
  name: 'leadAssignments',
  initialState,
  reducers: {
    setSearch(state, action) {
      state.filters.search = action.payload || '';
      state.pagination.page = 1;
    },
    setPage(state, action) {
      state.pagination.page = action.payload;
    },
    clearSaveError(state) {
      state.saveError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (state) => {
        state.leads.status = 'loading';
        state.leads.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.leads.status = 'succeeded';
        state.leads.items = action.payload.items;
        state.pagination = { ...state.pagination, ...action.payload.pagination };
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.leads.status = 'failed';
        state.leads.error = action.payload || { message: 'Failed to load leads' };
      })

      .addCase(fetchAssignmentHistory.pending, (state) => {
        state.history.status = 'loading';
      })
      .addCase(fetchAssignmentHistory.fulfilled, (state, action) => {
        state.history.status = 'succeeded';
        state.history.items = action.payload;
        state.history.latestByLead = buildLatestAssignmentMap(action.payload);
      })
      .addCase(fetchAssignmentHistory.rejected, (state) => {
        state.history.status = 'failed';
      })

      .addCase(fetchSalesPersons.pending, (state) => {
        state.salesPersons.status = 'loading';
      })
      .addCase(fetchSalesPersons.fulfilled, (state, action) => {
        state.salesPersons.status = 'succeeded';
        state.salesPersons.items = action.payload;
      })
      .addCase(fetchSalesPersons.rejected, (state) => {
        state.salesPersons.status = 'failed';
      })

      .addCase(fetchWorkload.pending, (state) => {
        state.workload.status = 'loading';
      })
      .addCase(fetchWorkload.fulfilled, (state, action) => {
        state.workload.status = 'succeeded';
        state.workload.items = action.payload;
      })
      .addCase(fetchWorkload.rejected, (state) => {
        state.workload.status = 'failed';
      })

      .addCase(assignLead.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })
      .addCase(assignLead.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(assignLead.rejected, (state, action) => {
        state.saving = false;
        state.saveError = action.payload || { message: 'Failed to assign lead' };
      })

      .addCase(runAutoAssign.pending, (state) => {
        state.autoRunning = true;
        state.autoRunError = null;
      })
      .addCase(runAutoAssign.fulfilled, (state) => {
        state.autoRunning = false;
      })
      .addCase(runAutoAssign.rejected, (state, action) => {
        state.autoRunning = false;
        state.autoRunError = action.payload || { message: 'Auto-assign failed' };
      });
  },
});

export const { setSearch, setPage, clearSaveError } = slice.actions;
export default slice.reducer;
