import { describe, expect, it } from 'vite-plus/test';
import { sessionOn } from './testFactories';
import type { IProgramme } from './types';
import { streakDays, todayTemplateId, weekDays } from './week';

// Tuesday, Thursday and Saturday are training days.
const programme: IProgramme = {
  days: [null, { templateId: 'pull' }, null, { templateId: 'push' }, null, { templateId: 'skills' }, null],
};
const now = new Date('2026-10-22T09:00:00'); // Thursday

describe('weekDays', () => {
  it('marks done, today, planned, missed and rest days', () => {
    const sessions = [sessionOn('2026-10-20', [])];
    expect(weekDays(programme, sessions, now).map((day) => day.status)).toEqual([
      'rest',
      'done',
      'rest',
      'today',
      'rest',
      'planned',
      'rest',
    ]);
    expect(weekDays(programme, [], now)[1].status).toBe('missed');
  });

  it('counts an unplanned session as done', () => {
    expect(weekDays(programme, [sessionOn('2026-10-19', [])], now)[0].status).toBe('done');
  });

  it('returns today’s template until today’s session is done', () => {
    expect(todayTemplateId(programme, [], now)).toBe('push');
    expect(todayTemplateId(programme, [sessionOn('2026-10-22', [])], now)).toBeUndefined();
  });
});

describe('streakDays', () => {
  it('is 0 without any session', () => {
    expect(streakDays(programme, [], now)).toBe(0);
  });

  it('counts days since the first session when nothing was missed', () => {
    const sessions = [sessionOn('2026-10-16', []), sessionOn('2026-10-20', [])];
    // Only Tuesdays are planned: the streak runs from Friday 16 to today.
    expect(
      streakDays({ ...programme, days: [null, { templateId: 'pull' }, null, null, null, null, null] }, sessions, now),
    ).toBe(7);
  });

  it('restarts after a missed planned day', () => {
    // Saturday 17 was planned (skills) and missed.
    const sessions = [sessionOn('2026-10-15', []), sessionOn('2026-10-20', [])];
    expect(streakDays(programme, sessions, now)).toBe(5);
  });
});
