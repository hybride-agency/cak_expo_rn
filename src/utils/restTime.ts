import type { WorkoutExercise } from '../types/plans';

const DEFAULT_REST_SECONDS = 90;
const MIN_REST_SECONDS = 60;
const MAX_REST_SECONDS = 120;

/**
 * Rest between sets, chosen by the backend per exercise from the user's quiz
 * answers. Always falls inside the 1-2 minute band the product guarantees.
 */
export const getRestSeconds = (exercise?: {
  rest_seconds?: number | string;
  rest?: number | string;
} | null): number => {
  const raw = Number(exercise?.rest_seconds ?? NaN);
  if (Number.isFinite(raw) && raw > 0) {
    return Math.min(Math.max(Math.round(raw), MIN_REST_SECONDS), MAX_REST_SECONDS);
  }

  return DEFAULT_REST_SECONDS;
};

export const formatRestLabel = (seconds: number): string => {
  if (seconds % 60 === 0) {
    const minutes = seconds / 60;
    return minutes === 1 ? '1 min' : `${minutes} min`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;

  return `${minutes}:${String(remainder).padStart(2, '0')} min`;
};

/** Ready-to-render rest label, preferring the label the backend already sent. */
export const getRestLabel = (
  exercise?: Pick<WorkoutExercise, 'rest' | 'rest_seconds' | 'rest_label'> | null,
): string => {
  const provided = exercise?.rest_label ?? exercise?.rest;
  if (typeof provided === 'string' && provided.trim().length) {
    return provided.trim();
  }

  return formatRestLabel(getRestSeconds(exercise));
};
