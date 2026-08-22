import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../axiosConfig";
import type {
  CurrentPlanData,
  HomepageData,
  MobilePlansData,
  ProfileData,
  ProfileUpdatePayload,
} from "../types/home";
import type {
  FitnessPlan,
  MealEntry,
  MealPlan,
  ProgressPhotoComparison,
  ProgressPhotoPose,
  ProgressPhotoStatus,
  WorkoutSchedule,
} from "../types/plans";
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
      performed_reps,
      weight_used,
      weight_unit,
    }: {
      userWorkoutExerciseId: number;
      is_completed: boolean;
      performed_reps?: number;
      weight_used?: number;
      weight_unit?: 'kg' | 'lb';
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await axiosInstance.put(
        `/mobile/fitness-plan/exercises/${userWorkoutExerciseId}/completion`,
        {is_completed, performed_reps, weight_used, weight_unit},
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
    {workoutDayId, rating, skip}: {workoutDayId: number; rating?: number; skip?: boolean},
    { rejectWithValue },
  ) => {
    try {
      const response = await axiosInstance.post("/mobile/fitness-plan/review", {
        workout_day_id: workoutDayId,
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

export const getWorkoutSchedule = createAsyncThunk(
  "home/getWorkoutSchedule",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/mobile/fitness-plan/schedule");
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to load your workout schedule"),
      );
    }
  },
);

export const updateWorkoutSchedule = createAsyncThunk(
  "home/updateWorkoutSchedule",
  async (
    { days_per_week, weekdays }: { days_per_week: number; weekdays: number[] },
    { rejectWithValue },
  ) => {
    try {
      const response = await axiosInstance.put(
        "/mobile/fitness-plan/schedule",
        { days_per_week, weekdays },
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to save your workout days"),
      );
    }
  },
);

export const getProgressPhotoStatus = createAsyncThunk(
  "home/getProgressPhotoStatus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        "/mobile/fitness-plan/progress-photo-status",
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to load your check-in"),
      );
    }
  },
);

/**
 * Uploads a check-in one pose at a time.
 *
 * Camera images run several megabytes each; sending all four in one request
 * overruns PHP's post_max_size and the whole check-in is rejected. One photo
 * per request keeps every upload small, and an early failure still leaves the
 * poses that already succeeded saved on the server.
 */
export const uploadProgressPhotos = createAsyncThunk(
  "home/uploadProgressPhotos",
  async (
    photos: Partial<Record<ProgressPhotoPose, { uri: string; name: string; type: string }>>,
    { rejectWithValue },
  ) => {
    const entries = Object.entries(photos).filter(([, file]) => Boolean(file)) as [
      ProgressPhotoPose,
      { uri: string; name: string; type: string },
    ][];

    // The last response carries the freshest check-in status.
    let lastResponse: { data?: { status?: ProgressPhotoStatus } } | null = null;

    for (const [pose, file] of entries) {
      try {
        const formData = new FormData();
        formData.append("image", file as unknown as Blob);
        formData.append("pose", pose);

        const response = await axiosInstance.post(
          "/mobile/fitness-plan/progress-photo",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        lastResponse = response.data;
      } catch (error: unknown) {
        return rejectWithValue(
          getApiErrorMessage(error, `Failed to upload your ${pose.replace("_", " ")} photo`),
        );
      }
    }

    return lastResponse;
  },
);

export const updateProgressPhotoSchedule = createAsyncThunk(
  "home/updateProgressPhotoSchedule",
  async (weekday: number | null, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        "/mobile/fitness-plan/progress-photo-schedule",
        { weekday },
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to save your check-in day"),
      );
    }
  },
);

export const getProgressPhotoComparison = createAsyncThunk(
  "home/getProgressPhotoComparison",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        "/mobile/fitness-plan/progress-photo-comparison",
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to load your comparison"),
      );
    }
  },
);

interface HomeState {
  loading: boolean;
  fitnessPlanLoading: boolean;
  fitnessPlanError: string | null;
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
  workoutSchedule: WorkoutSchedule | null;
  workoutScheduleSaving: boolean;
  progressPhotoStatus: ProgressPhotoStatus | null;
  progressPhotoComparison: ProgressPhotoComparison | null;
  progressPhotoUploading: boolean;
}

const initialState: HomeState = {
  loading: false,
  fitnessPlanLoading: false,
  fitnessPlanError: null,
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
  workoutSchedule: null,
  workoutScheduleSaving: false,
  progressPhotoStatus: null,
  progressPhotoComparison: null,
  progressPhotoUploading: false,
};

const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getWorkoutSchedule.fulfilled, (state, action) => {
        state.workoutSchedule = action.payload?.data ?? action.payload;
      })
      .addCase(updateWorkoutSchedule.pending, (state) => {
        state.workoutScheduleSaving = true;
        state.error = null;
      })
      .addCase(updateWorkoutSchedule.fulfilled, (state, action) => {
        state.workoutScheduleSaving = false;
        state.workoutSchedule = action.payload?.data ?? action.payload;
        // The backend rebuilds the week for the new days on the next fetch.
        state.fitnessPlan = null;
      })
      .addCase(updateWorkoutSchedule.rejected, (state, action) => {
        state.workoutScheduleSaving = false;
        state.error = action.payload as string;
      })
      .addCase(getProgressPhotoStatus.fulfilled, (state, action) => {
        state.progressPhotoStatus = action.payload?.data ?? action.payload;
      })
      .addCase(uploadProgressPhotos.pending, (state) => {
        state.progressPhotoUploading = true;
        state.error = null;
      })
      .addCase(uploadProgressPhotos.fulfilled, (state, action) => {
        state.progressPhotoUploading = false;
        const status = action.payload?.data?.status;
        if (status) state.progressPhotoStatus = status;
      })
      .addCase(uploadProgressPhotos.rejected, (state, action) => {
        state.progressPhotoUploading = false;
        state.error = action.payload as string;
      })
      .addCase(updateProgressPhotoSchedule.fulfilled, (state, action) => {
        state.progressPhotoStatus = action.payload?.data ?? action.payload;
      })
      .addCase(getProgressPhotoComparison.fulfilled, (state, action) => {
        const comparison = action.payload?.data ?? action.payload;
        state.progressPhotoComparison = comparison;
        if (comparison?.status) state.progressPhotoStatus = comparison.status;
      })
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
      .addCase(updateProfile.pending, (state) => {
        state.savingProfile = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.savingProfile = false;
        state.profile = action.payload?.data ?? action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.savingProfile = false;
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
        state.fitnessPlanLoading = false;
        state.fitnessPlanError = null;
        state.fitnessPlan = action.payload?.data ?? action.payload;
      })
      .addCase(getFitnessPlan.pending, (state) => {
        state.fitnessPlanLoading = true;
        state.fitnessPlanError = null;
      })
      .addCase(getFitnessPlan.rejected, (state, action) => {
        state.fitnessPlanLoading = false;
        state.fitnessPlanError = action.payload as string;
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
        const {id, is_completed, kcal_burned, performed_reps, weight_used, weight_unit} =
          action.payload?.data ?? action.payload;

        if (state.fitnessPlan && state.fitnessPlan.days) {
          state.fitnessPlan.days.forEach((day) => {
            if (day.sections) {
              day.sections.forEach((section) => {
                if (section.exercises) {
                  section.exercises.forEach((ex) => {
                    if (ex.id === id) {
                      ex.is_completed = is_completed;
                      ex.kcal_burned = kcal_burned;
                      ex.performed_reps = performed_reps;
                      ex.weight_used = weight_used;
                      ex.weight_unit = weight_unit;
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
