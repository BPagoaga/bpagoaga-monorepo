import { describe, expect, it } from 'vite-plus/test';
import { bestBetween, personalRecords, weeklyVolume } from './records';
import { sessionOn } from './testFactories';
import type { ILevelTestResult } from './types';

const now = new Date('2026-10-23T09:00:00');
const levelTest: ILevelTestResult = {
  id: 'test',
  takenAt: new Date('2026-09-01T10:00:00').toISOString(),
  results: { pull: 9, push: 32, dips: 14, core: 40 },
};

describe('personalRecords', () => {
  it('keeps the best set per exercise, level tests included, newest first', () => {
    const sessions = [
      sessionOn('2026-10-14', [{ exerciseId: 'traction-stricte', sets: [{ reps: 12 }] }]),
      sessionOn('2026-10-21', [{ exerciseId: 'traction-stricte', sets: [{ reps: 14 }, { reps: 10 }] }]),
    ];
    const records = personalRecords(sessions, [levelTest], now);
    expect(records[0]).toMatchObject({ exerciseId: 'traction-stricte', set: { reps: 14 }, isNew: true });
    expect(records.find((record) => record.exerciseId === 'hollow-body-hold')).toMatchObject({
      set: { seconds: 40 },
      isNew: false,
    });
  });

  it('ignores the session in progress', () => {
    const current = sessionOn('2026-10-23', [{ exerciseId: 'dips', sets: [{ reps: 30 }] }], { endedAt: undefined });
    expect(personalRecords([current], [], now)).toEqual([]);
  });
});

describe('bestBetween', () => {
  it('limits the best set to a period', () => {
    const sessions = [
      sessionOn('2026-09-10', [{ exerciseId: 'pompe', sets: [{ reps: 40 }] }]),
      sessionOn('2026-10-10', [{ exerciseId: 'pompe', sets: [{ reps: 35 }] }]),
    ];
    expect(bestBetween(sessions, [], 'pompe', new Date('2026-10-01'), new Date('2026-11-01'))).toMatchObject({
      reps: 35,
    });
  });
});

describe('weeklyVolume', () => {
  it('sums reps per ISO week, holds excluded', () => {
    const sessions = [
      sessionOn('2026-10-21', [
        { exerciseId: 'traction-stricte', sets: [{ reps: 10 }, { reps: 8 }] },
        { exerciseId: 'l-sit', sets: [{ seconds: 20 }] },
      ]),
      sessionOn('2026-10-14', [{ exerciseId: 'pompe', sets: [{ reps: 30 }] }]),
    ];
    const volume = weeklyVolume(sessions, now, 3);
    expect(volume).toEqual([
      { label: 'S41', value: 0 },
      { label: 'S42', value: 30 },
      { label: 'S43', value: 18 },
    ]);
  });
});
