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
      state.isAuthenticated = apiClient.auth.isLoggedIn();
      // Try to sync user from localStorage if we saved it there
      if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            state.user = JSON.parse(userStr);
          } catch (e) {
            state.user = null;
          }
        }
      }
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
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { syncAuth, logout } = authSlice.actions;
export default authSlice.reducer;
