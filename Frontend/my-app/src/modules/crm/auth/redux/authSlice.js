import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../services/authService';
import { tokenStorage } from '../../../../shared/utils/tokenStorage';
import { extractApiError } from '../../../../shared/api/axiosClient';

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { accessToken, user } = await authService.login(credentials);
      return { accessToken, user };
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  },
);

export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (credential, { rejectWithValue }) => {
    try {
      const { accessToken, user } = await authService.loginWithGoogle({ credential });
      return { accessToken, user };
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  },
);

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const data = await authService.me();
      const user = data.user || data;
      const permissions = data.permissions || user.permissions || [];
      return { ...user, permissions };
    } catch (err) {
      return rejectWithValue(extractApiError(err));
    }
  },
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
});

const initialState = {
  token: tokenStorage.getAccessToken(),
  user: null,
  status: 'idle',
  error: null,
  bootstrapped: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuth(state) {
      state.token = null;
      state.user = null;
      state.status = 'idle';
      state.error = null;
      state.bootstrapped = true;
      tokenStorage.clear();
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.accessToken || state.token;
        if (action.payload.user) {
          state.user = action.payload.user;
          state.bootstrapped = true;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Login failed' };
      })

      .addCase(googleLogin.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.accessToken || state.token;
        if (action.payload.user) {
          state.user = action.payload.user;
          state.bootstrapped = true;
        }
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Google sign-in failed' };
      })

      .addCase(fetchMe.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.bootstrapped = true;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.status = 'failed';
        state.user = null;
        state.token = null;
        state.bootstrapped = true;
        state.error = action.payload || { message: 'Session expired' };
        tokenStorage.clear();
      })

      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.status = 'idle';
        state.error = null;
        state.bootstrapped = true;
      });
  },
});

export const { clearAuth, clearError } = authSlice.actions;
export default authSlice.reducer;
