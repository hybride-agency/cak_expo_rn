export interface TutorialData {
  id: number;
  tutorial_id: number;
  logo_url: string;
  image_url: string;
  order: number;
  is_hidden: number;
  created_at: string;
  updated_at: string;
  tutorial: {
    id: number;
    alias: string;
    name: string;
    created_at: string;
    updated_at: string;
  };
  tutorial_page_langinfos: {
    id: number;
    tutorial_page_id: number;
    language_id: number;
    title: string;
    description: string | null;
    created_at: string;
    updated_at: string;
  }[];
}

export interface SubmitAnswer {
  question_id: number;
  answer_values: string[];
}

export interface SubmitAnswerResponse {
  submission: {
    id: number;
    user_id: number;
    quiz_id: number;
    answers: SubmitAnswer[];
    created_at: string;
    updated_at: string;
    quiz: {
      id: number;
      alias: string;
      name: string;
      created_at: string;
      updated_at: string;
    };
    created_at: string;
    updated_at: string;
    user: {
      id: number;
      name: string;
      email: string;
      created_at: string;
      updated_at: string;
      email_verified_at: string;
      two_factor_secret: string;
      two_factor_enabled: number;
      two_factor_recovery_codes: string;
      two_factor_confirmed_at: string;
      role: string;
      test_completed: boolean;
    };
  };
  answered_questions_count: number;
  tdee_calculations: {
    activity_level: string;
    tdee: number;
    is_selected: boolean;
  }[];
  tdee_per_day: number;
}

export interface Section {
    id: number;
    alias: string;
    page: string;
    image_url: string;
    title: string;
    description: string;
    content: string;
    button_text: string;
}

export interface Plan {
    id: number;
    name: string;
}

export interface PlanPrice {
    id: number;
    alias: string;
    image_url: string;
    free_trial_days: number;
    is_active: number;
    name: string;
    description: string;
    features: string;
    terms: string;
    pricings: {
        id: number;
        type: string;
        price: number;
        title: string;
        description: string;
        interval: string;
        currency: string;
        created_at: string;
        updated_at: string;
    }[];
    created_at: string;
    updated_at: string;
}
