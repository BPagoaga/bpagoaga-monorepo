import type { ILoggedSet, ISession, ISessionExercise } from './types';

/** Test helper: a finished session on a given local day with one exercise. */
export const sessionOn = (
  day: string,
  exercises: { exerciseId: string; sets: Omit<ILoggedSet, 'doneAt'>[] }[],
  overrides: Partial<ISession> = {},
): ISession => {
  const startedAt = new Date(`${day}T18:00:00`).toISOString();
  const doneAt = new Date(`${day}T18:30:00`).toISOString();
  return {
    id: `session-${day}`,
    title: 'Séance',
    startedAt,
    endedAt: new Date(`${day}T19:00:00`).toISOString(),
    exercises: exercises.map((exercise): ISessionExercise => ({
      ...exercise,
      sets: exercise.sets.map((set) => ({ ...set, doneAt })),
    })),
    ...overrides,
  };
};
