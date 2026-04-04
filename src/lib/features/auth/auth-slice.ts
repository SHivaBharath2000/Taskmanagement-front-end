import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient, User } from '@/lib/api-client';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk('auth/login', async (creds: any, { rejectWithValue }) => {
  try {
    return await apiClient.auth.login(creds.email, creds.password);
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const registerUser = createAsyncThunk('auth/register', async (data: any, { rejectWithValue }) => {
  try {
    return await apiClient.auth.register(data.name, data.email, data.password);
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    syncAuth: (state) => {
      state.isAuthenticated = apiClient.auth.check();
    },
    logout: (state) => {
      apiClient.auth.logout();
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      });
  },
});

export const { syncAuth, logout } = authSlice.actions;
export default authSlice.reducer;
