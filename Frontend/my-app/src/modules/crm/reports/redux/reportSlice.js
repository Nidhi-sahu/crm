import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reportService } from '../services/reportService';
import { extractApiError } from '../../../../shared/api/axiosClient';

export const generateReport = createAsyncThunk(
  'reports/generate',
  async (params, { rejectWithValue }) => {
    try {
      return await reportService.generate(params);
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  },
);

const initialState = {
  filters: {
    preset: 'mtd',
    customFrom: '',
    customTo: '',
    reportType: 'organization',
    salespersonId: '',
  },
  appliedRange: { from: null, to: null },
  data: null,
  status: 'idle',
  error: null,
};

const slice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setFilter(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    setAppliedRange(state, action) {
      state.appliedRange = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateReport.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(generateReport.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(generateReport.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to generate report' };
      });
  },
});

export const { setFilter, setAppliedRange } = slice.actions;
export default slice.reducer;
