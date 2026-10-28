import { describe, expect, it } from 'vite-plus/test';
import { formatClock, formatDuration, formatRecord, formatSet, formatTarget } from './format';

describe('formatTarget', () => {
  it('formats reps, holds, per-leg and weighted targets', () => {
    expect(formatTarget({ sets: 3, reps: 8 })).toBe('3 × 8 reps');
    expect(formatTarget({ sets: 4, reps: 'max' })).toBe('4 × max');
    expect(formatTarget({ sets: 3, seconds: 20 })).toBe('3 × 20 s');
    expect(formatTarget({ sets: 3, reps: 5 }, { measure: 'reps', unilateral: true })).toBe('3 × 5 / jambe');
    expect(formatTarget({ sets: 3, reps: 5, loadKg: 20 })).toBe('3 × 5 reps · +20 kg');
  });
});

describe('formatSet / formatRecord', () => {
  it('formats a logged set and a record', () => {
    expect(formatSet({ reps: 12 })).toBe('12');
    expect(formatSet({ seconds: 18 })).toBe('18 s');
    expect(formatSet({ reps: 5, loadKg: 20 })).toBe('+20 kg × 5');
    expect(formatRecord({ reps: 14 })).toBe('14 reps');
    expect(formatRecord({ seconds: 18 })).toBe('18 s');
  });
});

describe('durations', () => {
  it('formats session durations and running clocks', () => {
    expect(formatDuration(58 * 60000)).toBe('58 min');
    expect(formatDuration(65 * 60000)).toBe('1 h 05');
    expect(formatClock(84_000)).toBe('1:24');
    expect(formatClock(3_725_000)).toBe('1:02:05');
  });
});
