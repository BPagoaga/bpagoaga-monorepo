import { describe, expect, it } from 'vite-plus/test';
import { dayIndex, isoWeek, startOfWeek } from './dates';

describe('dates', () => {
  it('counts days from Monday', () => {
    expect(dayIndex(new Date('2026-10-19T12:00:00'))).toBe(0); // Monday
    expect(dayIndex(new Date('2026-10-25T12:00:00'))).toBe(6); // Sunday
    expect(startOfWeek(new Date('2026-10-23T12:00:00')).getDate()).toBe(19);
  });

  it('computes ISO week numbers', () => {
    expect(isoWeek(new Date('2026-10-23T12:00:00'))).toBe(43);
    expect(isoWeek(new Date('2027-01-01T12:00:00'))).toBe(53);
    expect(isoWeek(new Date('2027-01-04T12:00:00'))).toBe(1);
  });
});
