import {toggleMultiSelectAnswer} from '../src/utils/quizSelections';

const answers = [
  {id: 12, title: 'Back issues'},
  {id: 13, title: 'Knee issues'},
  {id: 16, title: 'No issues', is_exclusive: true},
];

describe('toggleMultiSelectAnswer', () => {
  it('clears selected injuries when no issues is selected', () => {
    expect(toggleMultiSelectAnswer(['12', '13'], answers[2], answers)).toEqual([
      '16',
    ]);
  });

  it('clears no issues when an injury is selected', () => {
    expect(toggleMultiSelectAnswer(['16'], answers[0], answers)).toEqual([
      '12',
    ]);
  });

  it('still allows multiple real injuries', () => {
    expect(toggleMultiSelectAnswer(['12'], answers[1], answers)).toEqual([
      '12',
      '13',
    ]);
  });

  it('recognizes legacy no issues copy when the API flag is absent', () => {
    const legacyAnswers = [
      {id: 18, title: 'Shoulder issues'},
      {id: 21, title: 'No issues'},
    ];

    expect(
      toggleMultiSelectAnswer(['18'], legacyAnswers[1], legacyAnswers),
    ).toEqual(['21']);
  });
});
