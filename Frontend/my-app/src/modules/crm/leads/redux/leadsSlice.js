import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { leadsService } from '../services/leadsService';
import { extractApiError } from '../../../../shared/api/axiosClient';
import { DEFAULT_PAGE_SIZE } from '../constants/leadColumns';

export const fetchLeads = createAsyncThunk(
  'leads/fetchList',
  async (params, { rejectWithValue }) => {
    try {
      return await leadsService.list(params);
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  },
);

export const fetchStages = createAsyncThunk(
  'leads/fetchStages',
  async (_, { rejectWithValue }) => {
    try {
      return await leadsService.listStages();
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  },
);

export const fetchLeadHistory = createAsyncThunk(
  'leads/fetchHistory',
  async (leadId, { rejectWithValue }) => {
    try {
      return await leadsService.getHistory(leadId);
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  },
);

export const fetchLeadComments = createAsyncThunk(
  'leads/fetchComments',
  async (leadId, { rejectWithValue }) => {
    try {
      return await leadsService.listComments(leadId);
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  },
);

export const addLeadComment = createAsyncThunk(
  'leads/addComment',
  async ({ leadId, comment, nextFollowupDate, nextFollowupTime }, { rejectWithValue }) => {
    try {
      return await leadsService.addComment(leadId, comment, nextFollowupDate, nextFollowupTime);
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  },
);

export const updateLead = createAsyncThunk(
  'leads/update',
  async ({ leadId, payload }, { rejectWithValue }) => {
    try {
      return await leadsService.update(leadId, payload);
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  },
);

export const moveLeadStage = createAsyncThunk(
  'leads/moveStage',
  async ({ leadId, toStageId, comment }, { rejectWithValue }) => {
    try {
      return await leadsService.moveStage(leadId, {
        toStageId,
        comment: comment || '',
        actualAt: new Date().toISOString(),
      });
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  },
);

export const undoLeadStage = createAsyncThunk(
  'leads/undoStage',
  async (leadId, { rejectWithValue }) => {
    try {
      return await leadsService.undoStage(leadId);
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  },
);

export const markLeadWon = createAsyncThunk(
  'leads/markWon',
  async (leadId, { rejectWithValue }) => {
    try {
      return await leadsService.markWon(leadId);
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  },
);

export const dropLead = createAsyncThunk(
  'leads/drop',
  async ({ leadId, reason }, { rejectWithValue }) => {
    try {
      return await leadsService.markDropped(leadId, reason);
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  },
);

const initialFilters = { search: '', uiStatus: '', stageId: '', activityDate: '' };

const initialState = {
  items: [],
  pagination: { page: 1, limit: DEFAULT_PAGE_SIZE, total: 0, totalPages: 1 },
  filters: { ...initialFilters },
  status: 'idle',
  error: null,
  stages: [],
  stagesStatus: 'idle',
  history: { items: [], status: 'idle' },
  comments: { items: [], status: 'idle' },
  saving: false,
  saveError: null,
};

const slice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    setFilter(state, action) {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    resetFilters(state) {
      state.filters = { ...initialFilters };
      state.pagination.page = 1;
    },
    setPage(state, action) {
      state.pagination.page = action.payload;
    },
    clearSaveError(state) {
      state.saveError = null;
    },
    resetDrawerState(state) {
      state.history = { items: [], status: 'idle' };
      state.comments = { items: [], status: 'idle' };
      state.saveError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items;
        state.pagination = { ...state.pagination, ...action.payload.pagination };
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to load leads' };
      })

      .addCase(fetchStages.pending, (state) => {
        state.stagesStatus = 'loading';
      })
      .addCase(fetchStages.fulfilled, (state, action) => {
        state.stagesStatus = 'succeeded';
        state.stages = action.payload;
      })
      .addCase(fetchStages.rejected, (state) => {
        state.stagesStatus = 'failed';
      })

      .addCase(fetchLeadHistory.pending, (state) => {
        state.history.status = 'loading';
      })
      .addCase(fetchLeadHistory.fulfilled, (state, action) => {
        state.history.status = 'succeeded';
        state.history.items = action.payload;
      })
      .addCase(fetchLeadHistory.rejected, (state) => {
        state.history.status = 'failed';
      })

      .addCase(fetchLeadComments.pending, (state) => {
        state.comments.status = 'loading';
      })
      .addCase(fetchLeadComments.fulfilled, (state, action) => {
        state.comments.status = 'succeeded';
        state.comments.items = action.payload;
      })
      .addCase(fetchLeadComments.rejected, (state) => {
        state.comments.status = 'failed';
      })

      .addCase(addLeadComment.fulfilled, (state, action) => {
        if (action.payload?._id) {
          state.comments.items = [action.payload, ...state.comments.items];
        }
      });

    // Generic saving handlers for mutation thunks
    [updateLead, moveLeadStage, undoLeadStage, markLeadWon, dropLead].forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.saving = true;
          state.saveError = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.saving = false;
          const updated = action.payload;
          if (updated?._id) {
            state.items = state.items.map((it) =>
              it._id === updated._id ? { ...it, ...updated } : it,
            );
          }
        })
        .addCase(thunk.rejected, (state, action) => {
          state.saving = false;
          state.saveError = action.payload || { message: 'Operation failed' };
        });
    });
  },
});

export const { setFilter, resetFilters, setPage, clearSaveError, resetDrawerState } = slice.actions;
export default slice.reducer;
