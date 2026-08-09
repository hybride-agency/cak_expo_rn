export interface WorkoutInstructionStep {
  title: string;
  description: string;
}

export interface WorkoutExercise {
  id: number;
  exercise_name?: string;
  normalized_name?: string;
  sets?: number | string;
  reps?: number | string;
  rest?: number | string;
  is_completed?: boolean;
  completed_at?: string | null;
  instruction_text?: string;
  instruction_steps?: WorkoutInstructionStep[];
  image_url?: string;
  video_url?: string | null;
  estimated_minutes?: number | string;
  calories_burned?: number | string;
  kcal_burned?: number | string;
  kcal?: number | string;
}

export interface WorkoutSection {
  id: number;
  section_name?: string;
  sort_order?: number;
  exercise_count?: number;
  completed_exercise_count?: number;
  exercises?: WorkoutExercise[];
}

export interface FitnessPlanDay {
  id?: number;
  date?: string;
  day_number?: number;
  day_name?: string;
  title?: string;
  description?: string;
  focus?: string;
  summary?: string;
  total_estimated_minutes?: number | string;
  next_exercise?: {
    category?: string;
    category_name?: string;
    exercise_name?: string;
    estimated_minutes?: number | string;
  } | null;
  completion_percentage?: number;
  rawSection?: WorkoutSection;
  sections?: WorkoutSection[];
}

export interface FitnessPlan {
  active_plan_alias?: string;
  has_video_access?: boolean;
  requires_quiz_completion?: boolean;
  week?: {
    start_date?: string;
    end_date?: string;
  };
  program_category?: string;
  program_variant?: string;
  days?: FitnessPlanDay[];
  weekly_progress?: unknown[];
  today_workout?: unknown;
  current_workout?: unknown;
  workout?: unknown;
  current_day_next_exercise?: unknown;
  review?: unknown;
  progress_photo_comparison?: unknown;
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
  ingredients?: string[];
  recipe?: string[];
}

export interface MealPlanDay {
  date?: string;
  day_name?: string;
  day_label?: string;
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
  ingredients?: string[];
  recipe?: string[];
}
