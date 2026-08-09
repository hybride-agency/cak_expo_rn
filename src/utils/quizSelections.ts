export interface MultiSelectQuizAnswer {
  id: number | string;
  title?: string | null;
  is_exclusive?: boolean;
}

const EXCLUSIVE_NONE_TITLES = new Set([
  'none',
  'no issue',
  'no issues',
  'no injury',
  'no injuries',
  'no pain',
  'none of the above',
]);

export const toggleMultiSelectAnswer = (
  currentValues: string[],
  selectedAnswer: MultiSelectQuizAnswer,
  availableAnswers: MultiSelectQuizAnswer[],
): string[] => {
  const selectedId = String(selectedAnswer.id);

  if (currentValues.includes(selectedId)) {
    return currentValues.filter(value => value !== selectedId);
  }

  if (isExclusiveAnswer(selectedAnswer)) {
    return [selectedId];
  }

  const exclusiveIds = new Set(
    availableAnswers
      .filter(isExclusiveAnswer)
      .map(answer => String(answer.id)),
  );

  return [
    ...currentValues.filter(value => !exclusiveIds.has(value)),
    selectedId,
  ];
};

const isExclusiveAnswer = (answer: MultiSelectQuizAnswer): boolean => {
  if (answer.is_exclusive === true) {
    return true;
  }

  const normalizedTitle = String(answer.title ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

  return EXCLUSIVE_NONE_TITLES.has(normalizedTitle);
};
