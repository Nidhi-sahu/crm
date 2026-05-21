import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { qualificationService } from '../services/qualificationService';
import { extractApiError } from '../../../../shared/api/axiosClient';

export const loadQuestions = createAsyncThunk(
  'qualifications/loadQuestions',
  async (_, { rejectWithValue }) => {
    try {
      return await qualificationService.loadQuestions();
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  },
);

export const loadExisting = createAsyncThunk(
  'qualifications/loadExisting',
  async (enquiryId, { rejectWithValue }) => {
    try {
      return await qualificationService.getExisting(enquiryId);
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  },
);

export const submitQualification = createAsyncThunk(
  'qualifications/submit',
  async (input, { rejectWithValue }) => {
    try {
      return await qualificationService.submit(input);
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  },
);

const initialState = {
  questions: [],
  questionsStatus: 'idle',
  existing: null,
  existingStatus: 'idle',
  saving: false,
  saveError: null,
};

const slice = createSlice({
  name: 'qualifications',
  initialState,
  reducers: {
    resetSession(state) {
      state.existing = null;
      state.existingStatus = 'idle';
      state.saving = false;
      state.saveError = null;
    },
    clearSaveError(state) {
      state.saveError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadQuestions.pending, (state) => {
        state.questionsStatus = 'loading';
      })
      .addCase(loadQuestions.fulfilled, (state, action) => {
        state.questionsStatus = 'succeeded';
        state.questions = action.payload;
      })
      .addCase(loadQuestions.rejected, (state) => {
        state.questionsStatus = 'failed';
      })

      .addCase(loadExisting.pending, (state) => {
        state.existingStatus = 'loading';
      })
      .addCase(loadExisting.fulfilled, (state, action) => {
        state.existingStatus = 'succeeded';
        state.existing = action.payload;
      })
      .addCase(loadExisting.rejected, (state) => {
        state.existingStatus = 'failed';
        state.existing = null;
      })

      .addCase(submitQualification.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })
      .addCase(submitQualification.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(submitQualification.rejected, (state, action) => {
        state.saving = false;
        state.saveError = action.payload || { message: 'Failed to submit qualification' };
      });
  },
});

export const { resetSession, clearSaveError } = slice.actions;
export default slice.reducer;
