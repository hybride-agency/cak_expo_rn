import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../axiosConfig';
import { Plan, Section } from '../../global';
import {getApiErrorMessage} from '../utils/apiError';

// Define the login async thunk
export const getPlan = createAsyncThunk(
  'plan/getPlan',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/mobile/plans');
      console.log('Mobile plans response:', response.data);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to load plans'));
    }
  },
);

export const getPlanPrice = createAsyncThunk(
  'plan/getPlanPrice',
  async ({ id }: { id: number }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/mobile/plans/${id}`);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getApiErrorMessage(error, 'Failed to load plan pricing'),
      );
    }
  },
);

const planSlice = createSlice({
  name: 'plan',
  initialState: {
    loading: false,
    error: null as string | null,
    plans: [] as Plan[],
    section: {} as Section,
    selectedPlanId: null as number | null,
  },
  reducers: {
    setSelectedPlan: (state, action: PayloadAction<number>) => {
      state.selectedPlanId = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getPlan.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.plans = action.payload.data.plans;
        state.section = action.payload.data.section;
      })
      .addCase(getPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getPlanPrice.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPlanPrice.fulfilled, state => {
        state.loading = false;
        state.error = null;
      })
      .addCase(getPlanPrice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedPlan } = planSlice.actions;
export default planSlice.reducer;
