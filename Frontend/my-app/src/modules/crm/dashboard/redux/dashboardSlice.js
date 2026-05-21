import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardService } from '../services/dashboardService';
import { extractApiError } from '../../../../shared/api/axiosClient';

const wrapThunk = (name, fn) =>
  createAsyncThunk(`dashboard/${name}`, async (filters, { rejectWithValue }) => {
    try {
      return await fn(filters);
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  });

export const fetchOverview = wrapThunk('fetchOverview', dashboardService.getOverview);
export const fetchSourceBreakdown = wrapThunk('fetchSourceBreakdown', dashboardService.getSourceBreakdown);
export const fetchSalespersonPerformance = wrapThunk(
  'fetchSalespersonPerformance',
  dashboardService.getSalespersonPerformance,
);
export const fetchEnquiryTrends = wrapThunk('fetchEnquiryTrends', dashboardService.getEnquiryTrends);
export const fetchConversionFunnel = wrapThunk(
  'fetchConversionFunnel',
  dashboardService.getConversionFunnel,
);

const sectionInitial = { data: null, status: 'idle', error: null };

const initialState = {
  overview: { ...sectionInitial },
  sourceBreakdown: { ...sectionInitial, data: [] },
  salespersonPerformance: { ...sectionInitial, data: [] },
  enquiryTrends: { ...sectionInitial, data: [] },
  conversionFunnel: { ...sectionInitial, data: { stages: [], overallConversionRate: 0 } },
};

const wireSection = (builder, thunk, key) => {
  builder
    .addCase(thunk.pending, (state) => {
      state[key].status = 'loading';
      state[key].error = null;
    })
    .addCase(thunk.fulfilled, (state, action) => {
      state[key].status = 'succeeded';
      state[key].data = action.payload;
    })
    .addCase(thunk.rejected, (state, action) => {
      state[key].status = 'failed';
      state[key].error = action.payload || { message: 'Request failed' };
    });
};

const slice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    resetDashboard: () => initialState,
  },
  extraReducers: (builder) => {
    wireSection(builder, fetchOverview, 'overview');
    wireSection(builder, fetchSourceBreakdown, 'sourceBreakdown');
    wireSection(builder, fetchSalespersonPerformance, 'salespersonPerformance');
    wireSection(builder, fetchEnquiryTrends, 'enquiryTrends');
    wireSection(builder, fetchConversionFunnel, 'conversionFunnel');
  },
});

export const { resetDashboard } = slice.actions;
export default slice.reducer;
