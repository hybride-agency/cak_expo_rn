import {
  buildMealOverviewCards,
  buildWorkoutOverviewCards,
} from '../src/screens/HomepageListView';
import type {HomepageSection} from '../src/types/home';

// Trimmed from the live /mobile/homepage payload.
const weeklyWorkoutSection = {
  type: 'weekly_workout_overview',
  title: 'Weekly workout overview',
  week: {start_date: '2026-08-03', end_date: '2026-08-09'},
  days: [
    {
      date: '2026-08-03',
      day_name: 'Monday',
      day_number: 1,
      focus: 'Push A',
      total_estimated_minutes: 37,
      next_exercise: {
        id: 639,
        category: 'Push A',
        category_name: 'Push A',
        exercise_name: 'incline bench press',
        estimated_minutes: 8,
      },
      categories: ['Chest', 'Push A'],
    },
    {
      date: '2026-08-09',
      day_name: 'Sunday',
      day_number: 7,
      focus: 'Push A',
      total_estimated_minutes: 38,
      next_exercise: {
        id: 738,
        category: 'Chest',
        category_name: 'Chest',
        exercise_name: 'seated chest press',
        estimated_minutes: 8,
      },
      categories: ['Chest'],
    },
  ],
} as unknown as HomepageSection;

const mealDaysSection = {
  type: 'meal_days_preview',
  title: 'Meals',
  week: {start_date: '2026-08-03', end_date: '2026-08-09'},
  days: [
    {
      date: '2026-08-03',
      day_label: 'Monday',
      target_kcal: 3286,
      consumed_kcal: 0,
      featured_meal: {id: 981, name: 'High-Protein Blueberry Pancakes'},
    },
    {
      date: '2026-08-09',
      day_label: 'Sunday',
      target_kcal: 3286,
      consumed_kcal: 3286,
      featured_meal: {id: 1011, name: 'Tofu Scramble and Bagel'},
    },
  ],
} as unknown as HomepageSection;

describe('buildWorkoutOverviewCards', () => {
  const cards = buildWorkoutOverviewCards(null, null, weeklyWorkoutSection);

  test('one card per day in the section', () => {
    expect(cards).toHaveLength(2);
  });

  test('titles come from day_name', () => {
    expect(cards.map(card => card.title)).toEqual(['Monday', 'Sunday']);
  });

  test('subtitle is the next exercise duration', () => {
    expect(cards.map(card => card.subtitle)).toEqual(['8 mins', '8 mins']);
  });

  test('each card carries the date used to open that day', () => {
    expect(cards.map(card => card.date)).toEqual(['2026-08-03', '2026-08-09']);
  });
});

describe('buildMealOverviewCards', () => {
  const cards = buildMealOverviewCards(null, null, mealDaysSection);

  test('one card per day in the section', () => {
    expect(cards).toHaveLength(2);
  });

  test('titles come from day_label', () => {
    expect(cards.map(card => card.title)).toEqual(['Monday', 'Sunday']);
  });

  test('carries no subtitle, so no kcal or clock renders', () => {
    expect(cards.map(card => card.subtitle)).toEqual(['', '']);
  });

  test('each card carries the date used to open that day', () => {
    expect(cards.map(card => card.date)).toEqual(['2026-08-03', '2026-08-09']);
  });
});

// The component finds sections by type off homepage.sections; this mirrors
// that lookup so the test exercises the same path as the screen.
describe('end to end from the /mobile/homepage payload', () => {
  const homepage = {
    sections: [
      {type: 'workout_progress', daily_progress: []},
      weeklyWorkoutSection,
      {type: 'water_intake', progress: {target_ml: 2000, total_ml: 1800}},
      mealDaysSection,
      {type: 'tips', title: 'Tips', message: 'Stay consistent'},
    ],
  } as never;

  const findSection = (type: string) =>
    (homepage as unknown as {sections: HomepageSection[]}).sections.find(
      section => section?.type === type,
    );

  test('workout cards show the estimated minutes', () => {
    const cards = buildWorkoutOverviewCards(
      homepage,
      null,
      findSection('weekly_workout_overview'),
    );

    expect(cards.map(card => card.subtitle)).toEqual(['8 mins', '8 mins']);
  });

  test('meal cards carry no subtitle', () => {
    const cards = buildMealOverviewCards(
      homepage,
      null,
      findSection('meal_days_preview'),
    );

    expect(cards.map(card => card.subtitle)).toEqual(['', '']);
    expect(cards.map(card => card.title)).toEqual(['Monday', 'Sunday']);
  });
});

describe('source selection', () => {
  test('a fallback source never tops up a short section', () => {
    const shortSection = {
      type: 'weekly_workout_overview',
      days: [(weeklyWorkoutSection as never as {days: unknown[]}).days[0]],
    } as unknown as HomepageSection;

    // fitnessPlan days carry no duration; mixing them in produced cards with
    // a missing time.
    const fitnessPlan = {
      days: [
        {date: '2026-08-04', day_name: 'Tuesday'},
        {date: '2026-08-05', day_name: 'Wednesday'},
      ],
    } as never;

    const cards = buildWorkoutOverviewCards(null, fitnessPlan, shortSection);

    expect(cards).toHaveLength(1);
    expect(cards[0].subtitle).toBe('8 mins');
  });
});
