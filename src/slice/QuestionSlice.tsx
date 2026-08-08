import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../axiosConfig';
import {getApiErrorMessage} from '../utils/apiError';
import type {SubmitAnswer} from '../../global';

// Define the login async thunk
export const getQuestionByGender = createAsyncThunk(
  'question/getQuestion',
  async (
    { gender }: { gender: string; silent?: boolean },
    { rejectWithValue },
  ) => {
    try {
      const response = await axiosInstance.get(
        `/mobile/sign-up-quiz?gender=${gender}`,
      );
      console.log('Quiz questions response:', response.data);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getApiErrorMessage(error, 'Get question failed'),
      );
    }
  },
);

export const getGender = createAsyncThunk(
  'question/getGender',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/mobile/sign-up-quiz`);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Get gender failed'));
    }
  },
);

export const submitAnswer = createAsyncThunk(
  'question/submitAnswer',
  async (
    {quiz_id, answers}: {quiz_id: number; answers: SubmitAnswer[]},
    { rejectWithValue },
  ) => {
    try {
      const response = await axiosInstance.post(`/mobile/quiz-submissions`, {
        quiz_id,
        answers,
      });
      console.log('Quiz submission response:', response.data);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getApiErrorMessage(error, 'Submit answer failed'),
      );
    }
  },
);

const QuestionSlice = createSlice({
  name: 'question',
  initialState: {
    loading: false,
    error: null as string | null,

  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getQuestionByGender.pending, (state, action) => {
        if (action.meta.arg.silent) {
          return;
        }
        state.loading = true;
        state.error = null;
      })
      .addCase(getQuestionByGender.fulfilled, (state, action) => {
        if (action.meta.arg.silent) {
          return;
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(getQuestionByGender.rejected, (state, action) => {
        if (action.meta.arg.silent) {
          return;
        }
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getGender.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGender.fulfilled, state => {
        state.loading = false;
        state.error = null;
      })
      .addCase(getGender.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(submitAnswer.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitAnswer.fulfilled, state => {
        state.loading = false;
        state.error = null;
      })
      .addCase(submitAnswer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default QuestionSlice.reducer;
