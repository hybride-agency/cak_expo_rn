import {isAxiosError} from 'axios';

interface ApiErrorEnvelope {
  message?: string;
  error_code?: string;
  data?: {
    token?: string;
    payment_id?: number | string;
  };
}

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (isAxiosError<ApiErrorEnvelope>(error)) {
    return error.response?.data?.message || fallback;
  }

  return error instanceof Error && error.message ? error.message : fallback;
};

export const getApiErrorResponse = (error: unknown) =>
  isAxiosError<ApiErrorEnvelope>(error) ? error.response : undefined;

export const getApiErrorStatus = (error: unknown): number | null =>
  getApiErrorResponse(error)?.status ?? null;

// A gateway error still carries the payment_id whenever Laravel already
// created the PaymentTransaction row before Whish's own call failed or
// timed out (e.g. their documented ambiguous error_code "500"). Reuse that
// id to poll for the true status instead of blindly retrying.
export const getApiErrorPaymentId = (error: unknown): number | null => {
  const response = getApiErrorResponse(error);
  const paymentId = response?.data?.data?.payment_id;
  const parsed = Number(paymentId);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};
