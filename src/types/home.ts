import type {HomepageAccess, UserProfile} from './auth';
import type {WorkoutExercise} from './plans';

export interface ApiItem {
  [key: string]: unknown;
  id?: number | string;
  type?: string;
  title?: string;
  name?: string;
  description?: string;
  short_description?: string;
  content?: string;
  message?: string;
  image_url?: string;
  thumbnail_url?: string;
  date?: string;
  day?: string;
  day_name?: string;
  day_number?: number;
  duration?: number | string;
  duration_minutes?: number | string;
  minutes?: number | string;
  estimated_minutes?: number | string;
  total_estimated_minutes?: number | string;
  day_total_estimated_minutes?: number | string;
  exercise_name?: string;
  category?: string;
  category_name?: string;
  next_exercise?: ApiItem | null;
  price?: number | string;
  monthly_price?: number | string;
  starting_price?: number | string;
  interval?: string;
  features?: string | string[];
  target_kcal?: number | string;
  kcal?: number | string;
  calories?: number | string;
  completion_percentage?: number | string;
  progress?: ApiItem;
  pricing?: ApiItem;
  pricings?: ApiItem[];
  pricing_options?: ApiItem[];
  plan?: PlanData;
  exercises?: WorkoutExercise[];
}

export interface PlanData extends ApiItem {
  alias?: string;
  display_name?: string;
  status?: string;
  is_active?: boolean;
  has_workout?: boolean;
  active_plan_alias?: string;
  plan_name?: string;
  end_date?: string;
}

export interface SubscriptionData extends ApiItem {
  status?: string;
  amount_paid?: number | string;
  end_date?: string;
  expires_at?: string;
  plan?: PlanData;
  plan_pricing?: ApiItem;
}

export interface HomepageSection extends ApiItem {
  upgrades?: ApiItem[];
  days?: ApiItem[];
  daily_progress?: ApiItem[];
  today_next_exercise?: ApiItem;
}

export interface HomepageData {
  user?: UserProfile;
  greeting_name?: string;
  sections?: HomepageSection[];
  subscription?: SubscriptionData;
  active_plan?: PlanData;
  plan_info?: PlanData;
  water_intake?: ApiItem;
  hydration?: ApiItem;
  calories?: ApiItem;
  daily_summary?: ApiItem;
  today_workout?: ApiItem;
  plans?: ApiItem[];
  recommended_plans?: ApiItem[];
  subscription_plans?: ApiItem[];
  section?: ApiItem;
  weekly_workout_overview?: {days?: ApiItem[]};
  weekly_overview?: ApiItem[];
  workouts?: ApiItem[];
  weekly_progress?: ApiItem[];
  meals?: ApiItem[];
  tips?: ApiItem[];
  advice?: ApiItem[];
}

export interface ProfileData extends UserProfile {
  user?: UserProfile;
  subscription?: SubscriptionData;
  current_subscription?: SubscriptionData;
  active_plan?: PlanData;
  homepage_access?: HomepageAccess;
  available_plans?: ApiItem[];
  section?: ApiItem;
  personal_data?: ApiItem;
  fitness_profile?: ApiItem;
}

export interface ProfileUpdatePayload {
  name?: string;
  email?: string;
  phone_number?: string | null;
  height_cm?: number;
  weight_kg?: number;
  age?: number;
  gender?: string;
}

export type EditableField = keyof ProfileUpdatePayload;

export interface MobilePlansData {
  plans?: ApiItem[];
  section?: ApiItem;
}

export interface CurrentPlanData {
  user_plan_id: number;
  plan_id: number;
  image_url: string | null;
  name: string;
  description: string | null;
  features: string | null;
  terms: string | null;
  status: string;
  amount_paid: number | string;
  currency: string;
  start_date: string | null;
  end_date: string | null;
}
