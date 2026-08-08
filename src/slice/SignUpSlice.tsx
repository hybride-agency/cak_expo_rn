import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../axiosConfig';
import {getApiErrorMessage} from '../utils/apiError';
import type {AuthResponseData} from '../types/auth';

// Define the login async thunk
export const signUpUser = createAsyncThunk(
  'signUp/signUpUser',
  async (
    {
      name,
      email,
      password,
      password_confirmation,
    }: {
      name: string;
      email: string;
      password: string;
      password_confirmation: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await axiosInstance.post('/auth/register', {
        name,
        email,
        password,
        password_confirmation,
      });
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Sign up failed'));
    }
  },
);

const signUpSlice = createSlice({
  name: 'signUp',
  initialState: {
    loading: false,
    error: null,
    action_plan: '',
    token: null,
  } as {
    loading: boolean;
    error: string | null;
    action_plan: string;
    token: string | null;
  },
  reducers: {
    setUser(state, action: PayloadAction<AuthResponseData>) {
      state.action_plan = action.payload.action_plan ?? '';
      state.token = action.payload.token ?? null;
    },
    clearUser(state) {
      state.action_plan = '';
      state.token = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(signUpUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUser, clearUser } = signUpSlice.actions;
export default signUpSlice.reducer;
