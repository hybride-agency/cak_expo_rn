import { formatRestLabel, getRestLabel, getRestSeconds } from '../src/utils/restTime';

describe('rest time', () => {
  it('keeps backend values inside the one to two minute band', () => {
    expect(getRestSeconds({ rest_seconds: 90 })).toBe(90);
    expect(getRestSeconds({ rest_seconds: 10 })).toBe(60);
    expect(getRestSeconds({ rest_seconds: 600 })).toBe(120);
  });

  it('falls back to the default when no rest was sent', () => {
    expect(getRestSeconds(undefined)).toBe(90);
    expect(getRestSeconds({})).toBe(90);
  });

  it('formats whole and partial minutes', () => {
    expect(formatRestLabel(60)).toBe('1 min');
    expect(formatRestLabel(120)).toBe('2 min');
    expect(formatRestLabel(75)).toBe('1:15 min');
  });

  it('prefers the label the backend already produced', () => {
    expect(getRestLabel({ rest_label: '90 sec', rest_seconds: 90 })).toBe('90 sec');
    expect(getRestLabel({ rest: '2 min' })).toBe('2 min');
    expect(getRestLabel({ rest_seconds: 105 })).toBe('1:45 min');
  });
});
