import {buildExerciseInstructionSteps} from '../src/utils/exerciseInstructions';

describe('buildExerciseInstructionSteps', () => {
  it('prefers the exercise-specific structured steps from the API', () => {
    const steps = buildExerciseInstructionSteps({
      id: 1,
      exercise_name: 'Goblet squat',
      instruction_text: 'Old fallback text',
      instruction_steps: [
        {title: 'Setup', description: 'Hold the dumbbell at your chest.'},
        {title: 'Movement', description: 'Sit the hips down between the knees.'},
        {title: 'Form & safety', description: 'Keep both feet planted.'},
      ],
    });

    expect(steps).toEqual([
      {title: 'Setup', description: 'Hold the dumbbell at your chest.'},
      {title: 'Movement', description: 'Sit the hips down between the knees.'},
      {title: 'Form & safety', description: 'Keep both feet planted.'},
    ]);
  });

  it('parses legacy paragraph instructions when structured steps are absent', () => {
    const steps = buildExerciseInstructionSteps({
      id: 2,
      exercise_name: 'Seated row',
      instruction_text: 'Sit tall at the cable.\n\nPull the elbows back.\n\nAvoid shrugging.',
    });

    expect(steps.map(step => step.title)).toEqual([
      'Setup',
      'Movement',
      'Form & safety',
    ]);
    expect(steps[1].description).toBe('Pull the elbows back.');
  });

  it('uses an exercise-specific fallback instead of shared generic copy', () => {
    const squatSteps = buildExerciseInstructionSteps({
      id: 3,
      exercise_name: 'Bodyweight squat',
    });
    const rowSteps = buildExerciseInstructionSteps({
      id: 4,
      exercise_name: 'Seated row',
    });

    expect(squatSteps).not.toEqual(rowSteps);
    expect(squatSteps.every(step => step.description.includes('Bodyweight squat'))).toBe(true);
    expect(rowSteps.every(step => step.description.includes('Seated row'))).toBe(true);
  });
});
