import {isAxiosError} from 'axios';

interface ApiErrorEnvelope {
  message?: string;
  data?: {
    token?: string;
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
