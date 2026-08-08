import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../axiosConfig';
import {getApiErrorMessage, getApiErrorResponse} from '../utils/apiError';
import type {AuthResponse} from '../types/auth';

type GoogleAuthPayload = {
  token: string;
  device_name: string;
};

type AppleAuthPayload = {
  token: string;
  name?: string;
  device_name: string;
};

// Define the login async thunk
export const loginUser = createAsyncThunk(
  'login/loginUser',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await axiosInstance.post('/auth/login', {
        email,
        password,
      });
      return response.data;
    } catch (error: unknown) {
      const response = getApiErrorResponse(error);
      if (response?.status === 403 && response.data?.data?.token) {
        return response.data;
      }
      return rejectWithValue(getApiErrorMessage(error, 'Login failed'));
    }
  },
);

export const googleAuthUser = createAsyncThunk(
  'login/googleAuthUser',
  async ({ token, device_name }: GoogleAuthPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/google', {
        token,
        device_name,
      });
      return response.data;
    } catch (error: unknown) {
      const response = getApiErrorResponse(error);
      if (response?.status === 403 && response.data?.data?.token) {
        return response.data;
      }
      return rejectWithValue(
        getApiErrorMessage(error, 'Google sign-in failed'),
      );
    }
  },
);

export const appleAuthUser = createAsyncThunk(
  'login/appleAuthUser',
  async ({ token, name, device_name }: AppleAuthPayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/apple', {
        token,
        name,
        device_name,
      });
      return response.data;
    } catch (error: unknown) {
      const response = getApiErrorResponse(error);
      if (response?.status === 403 && response.data?.data?.token) {
        return response.data;
      }
      return rejectWithValue(
        getApiErrorMessage(error, 'Apple sign-in failed'),
      );
    }
  },
);

interface LoginState {
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
  user: AuthResponse | null;
  value: number;
}

const initialState: LoginState = {
  isLoggedIn: false,
  loading: false,
  error: null,
  user: null,
  value: 0,
};

const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    setIsLoggedIn: (state, action) => {
      state.isLoggedIn = action.payload;
    },
    hydrateLoginSession: (state, action) => {
      state.isLoggedIn = action.payload.isLoggedIn;
      state.user = action.payload.user;
      state.error = null;
    },
    clearError: state => {
      state.error = null;
    },
    logout: state => {
      state.isLoggedIn = false;
      state.user = null;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loginUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isLoggedIn = false;
        state.error = action.payload as string;
      })
      .addCase(googleAuthUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleAuthUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(googleAuthUser.rejected, (state, action) => {
        state.loading = false;
        state.isLoggedIn = false;
        state.error = action.payload as string;
      })
      .addCase(appleAuthUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(appleAuthUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(appleAuthUser.rejected, (state, action) => {
        state.loading = false;
        state.isLoggedIn = false;
        state.error = action.payload as string;
      });
  },
});

export const { setIsLoggedIn, hydrateLoginSession, clearError, logout } =
  loginSlice.actions;
export default loginSlice.reducer;
