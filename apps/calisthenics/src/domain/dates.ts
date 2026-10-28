const DAY_MS = 24 * 60 * 60 * 1000;

export const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

/** 0 = Monday … 6 = Sunday (the programme's order). */
export const dayIndex = (date: Date) => (date.getDay() + 6) % 7;

export const startOfWeek = (date: Date) => addDays(startOfDay(date), -dayIndex(date));

export const isSameDay = (a: Date, b: Date) => startOfDay(a).getTime() === startOfDay(b).getTime();

export const daysBetween = (from: Date, to: Date) =>
  Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY_MS);

/** ISO 8601 week number (weeks start on Monday, week 1 contains the year's first Thursday). */
export const isoWeek = (date: Date) => {
  const thursday = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 3 - dayIndex(date)));
  const yearStart = Date.UTC(thursday.getUTCFullYear(), 0, 1);
  return Math.floor((thursday.getTime() - yearStart) / DAY_MS / 7) + 1;
};
