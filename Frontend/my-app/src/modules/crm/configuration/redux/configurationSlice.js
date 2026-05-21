import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { configurationService } from '../services/configurationService';
import { extractApiError } from '../../../../shared/api/axiosClient';
import { DEFAULT_STAGES } from '../constants/defaultStages';

let keySeq = 0;
const newKey = () => {
  keySeq += 1;
  return `step_${Date.now()}_${keySeq}`;
};

const draftFromStages = (stages) =>
  stages.map((s) => ({ key: newKey(), id: s._id, name: s.name }));

const draftFromDefaults = () =>
  DEFAULT_STAGES.map((name) => ({ key: newKey(), id: null, name }));

export const fetchStages = createAsyncThunk(
  'configuration/fetchStages',
  async (_, { rejectWithValue }) => {
    try {
      return await configurationService.listStages();
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  },
);

export const saveStages = createAsyncThunk(
  'configuration/saveStages',
  async (draft, { rejectWithValue }) => {
    try {
      return await configurationService.bulkSave(draft);
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  },
);

const initialState = {
  draft: [],
  status: 'idle',
  error: null,
  saving: false,
  saveError: null,
  dirty: false,
};

const slice = createSlice({
  name: 'configuration',
  initialState,
  reducers: {
    addStep(state, action) {
      const name = (action.payload || '').trim();
      if (name.length < 2) return;
      state.draft.push({ key: newKey(), id: null, name });
      state.dirty = true;
    },
    editStep(state, action) {
      const { key, name } = action.payload;
      const step = state.draft.find((s) => s.key === key);
      if (step) {
        step.name = name;
        state.dirty = true;
      }
    },
    deleteStep(state, action) {
      state.draft = state.draft.filter((s) => s.key !== action.payload);
      state.dirty = true;
    },
    moveStep(state, action) {
      const { key, dir } = action.payload;
      const idx = state.draft.findIndex((s) => s.key === key);
      const target = idx + dir;
      if (idx < 0 || target < 0 || target >= state.draft.length) return;
      const arr = state.draft;
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      state.dirty = true;
    },
    resetToDefault(state) {
      state.draft = draftFromDefaults();
      state.dirty = true;
    },
    clearSaveError(state) {
      state.saveError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStages.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchStages.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.draft = draftFromStages(action.payload);
        state.dirty = false;
      })
      .addCase(fetchStages.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Failed to load stages' };
      })

      .addCase(saveStages.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })
      .addCase(saveStages.fulfilled, (state, action) => {
        state.saving = false;
        state.dirty = false;
        state.draft = draftFromStages(action.payload.stages);
      })
      .addCase(saveStages.rejected, (state, action) => {
        state.saving = false;
        state.saveError = action.payload || { message: 'Failed to save stages' };
      });
  },
});

export const {
  addStep,
  editStep,
  deleteStep,
  moveStep,
  resetToDefault,
  clearSaveError,
} = slice.actions;
export default slice.reducer;
