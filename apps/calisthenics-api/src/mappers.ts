import type { schema } from './db';

// Database rows → API responses: dates as ISO strings, nulls left out (the core types use optional fields).

type Row<T extends { $inferSelect: unknown }> = T['$inferSelect'];

const iso = (date: Date) => date.toISOString();

export const toTemplate = (row: Row<typeof schema.templates>) => ({
  id: row.id,
  name: row.name,
  items: row.items,
  createdAt: iso(row.createdAt),
  updatedAt: iso(row.updatedAt),
});

export const toSession = (row: Row<typeof schema.sessions>) => ({
  id: row.id,
  templateId: row.templateId ?? undefined,
  title: row.title,
  startedAt: iso(row.startedAt),
  endedAt: row.endedAt ? iso(row.endedAt) : undefined,
  rpe: row.rpe ?? undefined,
  feeling: row.feeling ?? undefined,
  notes: row.notes ?? undefined,
  exercises: row.exercises,
});

export const toProgress = (row: Row<typeof schema.progress>) => ({
  progressionId: row.progressionId,
  currentStep: row.currentStep,
  history: row.history,
});

export const toLevelTest = (row: Row<typeof schema.levelTests>) => ({
  id: row.id,
  takenAt: iso(row.takenAt),
  results: row.results,
});

/** Seven days, Monday first; a missing row is a rest day. */
export const toProgramme = (rows: Row<typeof schema.programmeDays>[]) => ({
  days: Array.from({ length: 7 }, (_, dayIndex) => {
    const templateId = rows.find((row) => row.dayIndex === dayIndex)?.templateId;
    return templateId ? { templateId } : null;
  }),
});
