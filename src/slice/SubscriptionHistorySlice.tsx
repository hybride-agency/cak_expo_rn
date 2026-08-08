import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axiosInstance from '../axiosConfig';
import {getApiErrorMessage} from '../utils/apiError';

export interface SubscriptionHistoryItem {
  id: number;
  plan_id: number;
  plan_name: string;
  status: string;
  start_date: string;
  end_date: string;
  amount_paid: string;
  currency: string;
  is_active: boolean;
  is_expired: boolean;
}

interface SubscriptionHistoryState {
  history: SubscriptionHistoryItem[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
}

export const getSubscriptionHistory = createAsyncThunk(
  'subscriptionHistory/getSubscriptionHistory',
  async (_, {rejectWithValue}) => {
    try {
      const response = await axiosInstance.get('/auth/subscription-history');
      console.log('Subscription history response:', response.data);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getApiErrorMessage(error, 'Failed to load subscription history'),
      );
    }
  },
);

const initialState: SubscriptionHistoryState = {
  history: [],
  loading: false,
  refreshing: false,
  error: null,
};

const subscriptionHistorySlice = createSlice({
  name: 'subscriptionHistory',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getSubscriptionHistory.pending, state => {
        state.loading = state.history.length === 0;
        state.refreshing = state.history.length > 0;
        state.error = null;
      })
      .addCase(getSubscriptionHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.error = null;
        state.history =
          action.payload?.data?.history ?? action.payload?.history ?? [];
      })
      .addCase(getSubscriptionHistory.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.error = action.payload as string;
      });
  },
});

export default subscriptionHistorySlice.reducer;
