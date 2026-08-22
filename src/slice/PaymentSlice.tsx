import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import axiosInstance from '../axiosConfig';
import {getApiErrorMessage, getApiErrorPaymentId, getApiErrorStatus} from '../utils/apiError';
import type {WhishPayment} from '../types/payments';

interface WhishCheckoutResponse {
  success: boolean;
  message: string;
  data: {payment: WhishPayment};
}

export interface CheckoutRejection {
  message: string;
  paymentId: number | null;
}

export const createWhishCheckout = createAsyncThunk<
  WhishPayment,
  {plan_id: number; plan_pricing_id: number; idempotencyKey: string},
  {rejectValue: CheckoutRejection}
>('payment/createWhishCheckout', async ({plan_id, plan_pricing_id, idempotencyKey}, {rejectWithValue}) => {
  try {
    const response = await axiosInstance.post<WhishCheckoutResponse>(
      '/mobile/payments/whish/checkout',
      {plan_id, plan_pricing_id},
      {headers: {'Idempotency-Key': idempotencyKey}},
    );
    return response.data.data.payment;
  } catch (error: unknown) {
    return rejectWithValue({
      message: getApiErrorMessage(error, 'Failed to start checkout'),
      paymentId: getApiErrorPaymentId(error),
    });
  }
});

export const requestPayInGym = createAsyncThunk<
  WhishPayment,
  {plan_id: number; plan_pricing_id: number},
  {rejectValue: CheckoutRejection}
>('payment/requestPayInGym', async ({plan_id, plan_pricing_id}, {rejectWithValue}) => {
  try {
    const response = await axiosInstance.post<WhishCheckoutResponse>(
      '/mobile/payments/pay-in-gym',
      {plan_id, plan_pricing_id},
    );
    return response.data.data.payment;
  } catch (error: unknown) {
    return rejectWithValue({
      message: getApiErrorMessage(error, 'Could not submit the pay-at-gym request'),
      paymentId: null,
    });
  }
});

export const createWhishRenewal = createAsyncThunk<
  WhishPayment,
  {userPlanId: number; plan_pricing_id?: number; idempotencyKey: string},
  {rejectValue: CheckoutRejection}
>('payment/createWhishRenewal', async ({userPlanId, plan_pricing_id, idempotencyKey}, {rejectWithValue}) => {
  try {
    const response = await axiosInstance.post<WhishCheckoutResponse>(
      `/mobile/subscriptions/${userPlanId}/renew`,
      plan_pricing_id ? {plan_pricing_id} : {},
      {headers: {'Idempotency-Key': idempotencyKey}},
    );
    return response.data.data.payment;
  } catch (error: unknown) {
    return rejectWithValue({
      message: getApiErrorMessage(error, 'Failed to start renewal'),
      paymentId: getApiErrorPaymentId(error),
    });
  }
});

export interface FetchPaymentRejection {
  message: string;
  status: number | null;
}

export const fetchWhishPayment = createAsyncThunk<
  WhishPayment,
  {paymentId: number},
  {rejectValue: FetchPaymentRejection}
>('payment/fetchWhishPayment', async ({paymentId}, {rejectWithValue}) => {
  try {
    const response = await axiosInstance.get<WhishCheckoutResponse>(
      `/mobile/payments/whish/${paymentId}`,
    );
    return response.data.data.payment;
  } catch (error: unknown) {
    return rejectWithValue({
      message: getApiErrorMessage(error, 'Failed to refresh payment status'),
      status: getApiErrorStatus(error),
    });
  }
});

export const getPayments = createAsyncThunk(
  'payment/getPayments',
  async ({page = 1}: {page?: number} = {}, {rejectWithValue}) => {
    try {
      const response = await axiosInstance.get('/mobile/payments', {
        params: {per_page: 20, page},
      });
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to load payment history'));
    }
  },
);

interface PaymentState {
  currentPayment: WhishPayment | null;
  checkoutLoading: boolean;
  checkoutError: string | null;
  payments: WhishPayment[];
  paymentsLoading: boolean;
  paymentsError: string | null;
}

const initialState: PaymentState = {
  currentPayment: null,
  checkoutLoading: false,
  checkoutError: null,
  payments: [],
  paymentsLoading: false,
  paymentsError: null,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setCurrentPayment: (state, action: PayloadAction<WhishPayment | null>) => {
      state.currentPayment = action.payload;
    },
    clearCheckoutError: state => {
      state.checkoutError = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(createWhishCheckout.pending, state => {
        state.checkoutLoading = true;
        state.checkoutError = null;
      })
      .addCase(createWhishCheckout.fulfilled, (state, action) => {
        state.checkoutLoading = false;
        state.currentPayment = action.payload;
      })
      .addCase(createWhishCheckout.rejected, (state, action) => {
        state.checkoutLoading = false;
        state.checkoutError = action.payload?.message ?? 'Failed to start checkout';
      })
      .addCase(requestPayInGym.pending, state => {
        state.checkoutLoading = true;
        state.checkoutError = null;
      })
      .addCase(requestPayInGym.fulfilled, (state, action) => {
        state.checkoutLoading = false;
        state.currentPayment = action.payload;
      })
      .addCase(requestPayInGym.rejected, (state, action) => {
        state.checkoutLoading = false;
        state.checkoutError = action.payload?.message ?? 'Could not submit the pay-at-gym request';
      })
      .addCase(createWhishRenewal.pending, state => {
        state.checkoutLoading = true;
        state.checkoutError = null;
      })
      .addCase(createWhishRenewal.fulfilled, (state, action) => {
        state.checkoutLoading = false;
        state.currentPayment = action.payload;
      })
      .addCase(createWhishRenewal.rejected, (state, action) => {
        state.checkoutLoading = false;
        state.checkoutError = action.payload?.message ?? 'Failed to start renewal';
      })
      .addCase(fetchWhishPayment.fulfilled, (state, action) => {
        state.currentPayment = action.payload;
      })
      .addCase(getPayments.pending, state => {
        state.paymentsLoading = true;
        state.paymentsError = null;
      })
      .addCase(getPayments.fulfilled, (state, action) => {
        state.paymentsLoading = false;
        state.payments = action.payload?.data?.payments ?? [];
      })
      .addCase(getPayments.rejected, (state, action) => {
        state.paymentsLoading = false;
        state.paymentsError = action.payload as string;
      });
  },
});

export const {setCurrentPayment, clearCheckoutError} = paymentSlice.actions;
export default paymentSlice.reducer;
