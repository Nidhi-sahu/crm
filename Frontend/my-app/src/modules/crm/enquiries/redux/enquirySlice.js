import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { enquiryService } from '../services/enquiryService';
import { extractApiError } from '../../../../shared/api/axiosClient';
import { DEFAULT_PAGE_SIZE } from '../constants/enquiryColumns';
import { uiStatusToBackend } from '../constants/enquiryStatuses';

const buildListParams = (state) => {
  const params = {
    page: state.pagination.page,
    limit: state.pagination.limit,
    sortBy: state.sort.sortBy,
    sortOrder: state.sort.sortOrder,
  };
  if (state.filters.search) params.search = state.filters.search;
  if (state.filters.uiStatus) {
    const backend = uiStatusToBackend(state.filters.uiStatus);
    if (backend) params.status = backend;
  }
  return params;
};

export const fetchEnquiries = createAsyncThunk(
  'enquiries/fetchList',
  async (params, { rejectWithValue }) => {
    try {
      return await enquiryService.list(params);
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  },
);

export const fetchEnquiryKpis = createAsyncThunk(
  'enquiries/fetchKpis',
  async (_, { rejectWithValue }) => {
    try {
      return await enquiryService.statusBreakdown();
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  },
);

export const createEnquiry = createAsyncThunk(
  'enquiries/create',
  async (payload, { rejectWithValue }) => {
    try {
      return await enquiryService.create(payload);
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  },
);

export const updateEnquiry = createAsyncThunk(
  'enquiries/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await enquiryService.update(id, payload);
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  },
);

const initialFilters = {
  search: '',
  uiStatus: '',
  activityDate: '',
};

const initialState = {
  items: [],
  pagination: { page: 1, limit: DEFAULT_PAGE_SIZE, total: 0, totalPages: 1 },
  filters: { ...initialFilters },
  sort: { sortBy: 'createdAt', sortOrder: 'desc' },
  status: 'idle',
  error: null,
  saving: false,
  saveError: null,
  kpis: { total: 0, pending: 0, qualified: 0, notQualified: 0 },
  kpisStatus: 'idle',
};

const slice = createSlice({
  name: 'enquiries',
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
      .addCase(fetchEnquiries.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchEnquiries.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items;
        state.pagination = { ...state.pagination, ...action.payload.pagination };
      })
      .addCase(fetchEnquiries.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to load enquiries' };
      })

      .addCase(fetchEnquiryKpis.pending, (state) => {
        state.kpisStatus = 'loading';
      })
      .addCase(fetchEnquiryKpis.fulfilled, (state, action) => {
        state.kpisStatus = 'succeeded';
        state.kpis = action.payload;
      })
      .addCase(fetchEnquiryKpis.rejected, (state) => {
        state.kpisStatus = 'failed';
      })

      .addCase(createEnquiry.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })
      .addCase(createEnquiry.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(createEnquiry.rejected, (state, action) => {
        state.saving = false;
        state.saveError = action.payload || { message: 'Failed to save enquiry' };
      })

      .addCase(updateEnquiry.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })
      .addCase(updateEnquiry.fulfilled, (state, action) => {
        state.saving = false;
        const updated = action.payload;
        if (updated?._id) {
          state.items = state.items.map((it) =>
            it._id === updated._id ? { ...it, ...updated } : it,
          );
        }
      })
      .addCase(updateEnquiry.rejected, (state, action) => {
        state.saving = false;
        state.saveError = action.payload || { message: 'Failed to update enquiry' };
      });
  },
});

export const { setFilter, resetFilters, setPage, setSort, clearSaveError } = slice.actions;
export { buildListParams };
export default slice.reducer;
