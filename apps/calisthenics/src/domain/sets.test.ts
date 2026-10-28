import { describe, expect, it } from 'vite-plus/test';
import { bestSet, meetsCriterion, setMeetsTarget } from './sets';

describe('sets', () => {
  it('prefers heavier, then longer or more reps', () => {
    expect(bestSet([{ reps: 14 }, { reps: 5, loadKg: 20 }, { reps: 8 }])).toEqual({ reps: 5, loadKg: 20 });
    expect(bestSet([{ seconds: 12 }, { seconds: 18 }])).toEqual({ seconds: 18 });
  });

  it('checks a set against a target', () => {
    expect(setMeetsTarget({ reps: 5 }, { sets: 3, reps: 5 })).toBe(true);
    expect(setMeetsTarget({ reps: 4 }, { sets: 3, reps: 5 })).toBe(false);
    expect(setMeetsTarget({ seconds: 14 }, { sets: 3, seconds: 15 })).toBe(false);
    expect(setMeetsTarget({ reps: 5 }, { sets: 3, reps: 5, loadKg: 10 })).toBe(false);
    expect(setMeetsTarget({ reps: 1 }, { sets: 4, reps: 'max' })).toBe(true);
  });

  it('meets a criterion only with enough qualifying sets in one session', () => {
    const criterion = { sets: 3, reps: 5 };
    expect(meetsCriterion({ sets: [{ reps: 5 }, { reps: 5 }, { reps: 4 }].map(withDate) }, criterion)).toBe(false);
    expect(meetsCriterion({ sets: [{ reps: 6 }, { reps: 5 }, { reps: 5 }].map(withDate) }, criterion)).toBe(true);
  });
});

function withDate(set: { reps: number }) {
  return { ...set, doneAt: '2026-10-21T18:00:00.000Z' };
}
