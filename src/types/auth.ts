export interface UserProfile {
  [key: string]: unknown;
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
  phone_number?: string;
  image_url?: string;
  age?: number | string;
  height?: number | string;
  weight?: number | string;
  height_cm?: number | string;
  weight_kg?: number | string;
  gender?: string;
  role?: string;
  test_completed?: boolean;
  has_active_plan?: boolean;
  has_password?: boolean;
}

export interface PlanSummary {
  [key: string]: unknown;
  alias?: string;
  name?: string;
  display_name?: string;
  end_date?: string;
  plan?: PlanSummary;
}

export interface HomepageAccess {
  can_access_homepage?: boolean;
  blocking_codes?: string[];
  active_plan_alias?: string;
}

export interface AuthResponseData {
  [key: string]: unknown;
  token?: string | null;
  action_plan?: string;
  homepage_access?: HomepageAccess;
  user?: UserProfile;
  active_plan?: PlanSummary;
}

export interface AuthResponse {
  [key: string]: unknown;
  data?: AuthResponseData;
  user?: UserProfile;
  active_plan?: PlanSummary;
}
