import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../axiosConfig";
import type {
  CurrentPlanData,
  HomepageData,
  MobilePlansData,
  ProfileData,
} from "../types/home";
import type { FitnessPlan, MealEntry, MealPlan } from "../types/plans";
import { getApiErrorMessage } from "../utils/apiError";

export const getHomepage = createAsyncThunk(
  "home/getHomepage",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/mobile/homepage");
      console.log("Homepage endpoint response:", response.data);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to load homepage"),
      );
    }
  },
);

export const getProfile = createAsyncThunk(
  "home/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/auth/profile");
      console.log("Profile response:", response.data);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to load profile"),
      );
    }
  },
);

export const getCurrentPlan = createAsyncThunk(
  "home/getCurrentPlan",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/auth/current-plan");
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to load current plan"),
      );
    }
  },
);

export const getCurrentPlan = createAsyncThunk(
  "home/getCurrentPlan",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/auth/current-plan");
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to load current plan"),
      );
    }
  },
);

export const getMobilePlans = createAsyncThunk(
  "home/getMobilePlans",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/mobile/plans");
      console.log("Mobile plans (HomeSlice) response:", response.data);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to load plans"));
    }
  },
);

export const getMealPlan = createAsyncThunk(
  "home/getMealPlan",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/mobile/meal-plan");
      console.log("Meal plan response:", response.data);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to load meal plan"),
      );
    }
  },
);

export const getFitnessPlan = createAsyncThunk(
  "home/getFitnessPlan",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/mobile/fitness-plan");
      console.log("Fitness plan response:", response.data);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to load fitness plan"),
      );
    }
  },
);

export const updateProfile = createAsyncThunk(
  "home/updateProfile",
  async (changes: ProfileUpdatePayload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put("/auth/profile", changes);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to update profile"),
      );
    }
  },
);

export const updateTodayWaterIntake = createAsyncThunk(
  "home/updateTodayWaterIntake",
  async ({ total_ml }: { total_ml: number }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put("/mobile/water-intake/today", {
        total_ml,
      });
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to update water intake"),
      );
    }
  },
);

export const updateMealCompletion = createAsyncThunk(
  "home/updateMealCompletion",
  async (
    { userMealId, is_completed }: { userMealId: number; is_completed: boolean },
    { rejectWithValue },
  ) => {
    try {
      const response = await axiosInstance.put(
        `/mobile/meal-plan/meals/${userMealId}/completion`,
        { is_completed },
      );
      console.log("Update meal completion response:", response.data);
      return { userMealId, is_completed, data: response.data };
    } catch (error: unknown) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to update meal"),
      );
    }
  },
);

export const updateExerciseCompletion = createAsyncThunk(
  "home/updateExerciseCompletion",
  async (
    {
      userWorkoutExerciseId,
      is_completed,
    }: { userWorkoutExerciseId: number; is_completed: boolean },
    { rejectWithValue },
  ) => {
    try {
      const response = await axiosInstance.put(
        `/mobile/fitness-plan/exercises/${userWorkoutExerciseId}/completion`,
        { is_completed },
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to update exercise"),
      );
    }
  },
);

export const submitWeeklyReview = createAsyncThunk(
  "home/submitWeeklyReview",
  async (
    { rating, skip }: { rating?: number; skip?: boolean },
    { rejectWithValue },
  ) => {
    try {
      const response = await axiosInstance.post("/mobile/fitness-plan/review", {
        ...(skip ? { skip: true } : { rating }),
      });
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to submit review"),
      );
    }
  },
);

interface HomeState {
  loading: boolean;
  refreshing: boolean;
  waterLoading: boolean;
  savingProfile: boolean;
  error: string | null;
  homepage: HomepageData | null;
  profile: ProfileData | null;
  mobilePlans: MobilePlansData | null;
  mealPlan: MealPlan | null;
  fitnessPlan: FitnessPlan | null;
  currentPlan: CurrentPlanData | null;
  currentPlanLoading: boolean;
}

const initialState: HomeState = {
  loading: false,
  refreshing: false,
  waterLoading: false,
  savingProfile: false,
  error: null,
  homepage: null,
  profile: null,
  mobilePlans: null,
  mealPlan: null,
  fitnessPlan: null,
  currentPlan: null,
  currentPlanLoading: false,
};

const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getHomepage.pending, (state) => {
        state.loading = !state.homepage;
        state.refreshing = !!state.homepage;
        state.error = null;
      })
      .addCase(getHomepage.fulfilled, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.homepage = action.payload?.data ?? action.payload;
      })
      .addCase(getHomepage.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.error = action.payload as string;
      })
      .addCase(getProfile.pending, (state) => {
        state.loading = !state.profile;
        state.refreshing = !!state.profile;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.profile = action.payload?.data ?? action.payload;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.error = action.payload as string;
      })
      .addCase(getCurrentPlan.pending, (state) => {
        state.currentPlanLoading = true;
      })
      .addCase(getCurrentPlan.fulfilled, (state, action) => {
        state.currentPlanLoading = false;
        state.currentPlan = action.payload?.data?.current_plan ?? null;
      })
      .addCase(getCurrentPlan.rejected, (state) => {
        state.currentPlanLoading = false;
      })
      .addCase(getMobilePlans.fulfilled, (state, action) => {
        state.mobilePlans = action.payload?.data ?? action.payload;
      })
      .addCase(getMealPlan.fulfilled, (state, action) => {
        state.mealPlan = action.payload?.data ?? action.payload;
      })
      .addCase(getFitnessPlan.fulfilled, (state, action) => {
        state.fitnessPlan = action.payload?.data ?? action.payload;
      })
      .addCase(updateTodayWaterIntake.pending, (state) => {
        state.waterLoading = true;
      })
      .addCase(updateTodayWaterIntake.fulfilled, (state, action) => {
        state.waterLoading = false;
        const nextData = action.payload?.data ?? action.payload;
        if (state.homepage && typeof state.homepage === "object") {
          state.homepage = {
            ...state.homepage,
            water_intake:
              nextData?.water_intake ?? nextData ?? state.homepage.water_intake,
          };
        }
      })
      .addCase(updateTodayWaterIntake.rejected, (state) => {
        state.waterLoading = false;
      })
      .addCase(updateMealCompletion.fulfilled, (state, action) => {
        const { userMealId, is_completed } = action.payload;

        // Helper to update meals in any nested structure
        const updateMealsInList = (meals?: MealEntry[]) => {
          if (!Array.isArray(meals)) return;
          meals.forEach((m) => {
            if (m.id === userMealId) {
              m.is_completed = is_completed;
              m.completed = is_completed;
            }
          });
        };

        if (state.mealPlan) {
          updateMealsInList(state.mealPlan.meals);
          if (state.mealPlan.today)
            updateMealsInList(state.mealPlan.today.meals);
          if (state.mealPlan.days) {
            state.mealPlan.days.forEach((day) => updateMealsInList(day.meals));
          }
        }
      })
      .addCase(updateExerciseCompletion.fulfilled, (state, action) => {
        const { id, is_completed } = action.payload?.data ?? action.payload;

        if (state.fitnessPlan && state.fitnessPlan.days) {
          state.fitnessPlan.days.forEach((day) => {
            if (day.sections) {
              day.sections.forEach((section) => {
                if (section.exercises) {
                  section.exercises.forEach((ex) => {
                    if (ex.id === id) {
                      ex.is_completed = is_completed;
                    }
                  });
                }
              });
            }
          });
        }
      });
  },
});

export default homeSlice.reducer;
