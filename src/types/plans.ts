export interface WorkoutExercise {
  id: number;
  exercise_name?: string;
  sets?: number | string;
  reps?: number | string;
  is_completed?: boolean;
  instruction_text?: string;
  image_url?: string;
  estimated_minutes?: number | string;
  calories_burned?: number | string;
  kcal?: number | string;
}

export interface WorkoutSection {
  id: number;
  section_name?: string;
  exercises?: WorkoutExercise[];
}

export interface FitnessPlanDay {
  id?: number;
  date?: string;
  day_name?: string;
  title?: string;
  description?: string;
  rawSection?: WorkoutSection;
  sections?: WorkoutSection[];
}

export interface FitnessPlan {
  days?: FitnessPlanDay[];
  weekly_progress?: unknown[];
  today_workout?: unknown;
  current_workout?: unknown;
  workout?: unknown;
}

export interface MealEntry {
  id?: number;
  slot?: string;
  type?: string;
  meal_type?: string;
  label?: string;
  title?: string;
  name?: string;
  kcal?: number | string;
  calories?: number | string;
  calories_kcal?: number | string;
  protein_g?: number | string;
  protein?: number | string;
  carbs_g?: number | string;
  carbs?: number | string;
  fat_g?: number | string;
  fat?: number | string;
  image_url?: string;
  thumbnail_url?: string;
  is_completed?: boolean;
  completed?: boolean;
}

export interface MealPlanDay {
  date?: string;
  day_name?: string;
  meals?: MealEntry[];
}

export interface MealPlan {
  meals?: MealEntry[];
  today?: MealPlanDay;
  days?: MealPlanDay[];
  water_progress?: unknown;
  water_intake?: unknown;
  hydration?: unknown;
  calories?: unknown;
  today_progress?: unknown;
  daily_summary?: unknown;
  tips?: unknown[];
}

export interface DisplayMeal {
  id: string;
  rawId?: number;
  label: string;
  title: string;
  kcal: number | string;
  protein: string;
  carbs: string;
  fat: string;
  image_url: string;
  is_completed: boolean;
}
