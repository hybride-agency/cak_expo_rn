import type {
  WorkoutExercise,
  WorkoutInstructionStep,
} from '../types/plans';

const STEP_TITLES = ['Setup', 'Movement', 'Form & safety'];

export const buildExerciseInstructionSteps = (
  exercise: WorkoutExercise,
): WorkoutInstructionStep[] => {
  const structuredSteps = (exercise.instruction_steps ?? [])
    .map((step, index) => ({
      title: cleanText(step?.title) || STEP_TITLES[index] || `Step ${index + 1}`,
      description: cleanText(step?.description),
    }))
    .filter(step => step.description.length > 0);

  if (structuredSteps.length > 0) {
    return structuredSteps;
  }

  const instructionText = cleanText(exercise.instruction_text);
  if (instructionText) {
    const blocks = instructionText
      .split(/\n\s*\n/)
      .map(cleanText)
      .filter(Boolean);

    return blocks.map((block, index) => ({
      title: STEP_TITLES[index] || `Step ${index + 1}`,
      description: block.replace(/^\d+[.)]\s*/, ''),
    }));
  }

  const exerciseName = cleanText(exercise.exercise_name) || 'this exercise';

  return [
    {
      title: 'Setup',
      description: `Prepare your space and take a stable starting position for ${exerciseName}.`,
    },
    {
      title: 'Movement',
      description: `Perform ${exerciseName} through a comfortable range with a slow, controlled tempo.`,
    },
    {
      title: 'Form & safety',
      description: `Keep each ${exerciseName} repetition controlled and stop if you feel sharp pain.`,
    },
  ];
};

const cleanText = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';
