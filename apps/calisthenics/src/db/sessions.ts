import type { FeelingEnum, ILoggedSet, ISession, ISessionExercise } from '../domain/types';
import { getDb, newId, now } from './schema';

/** Newest first. */
export const listSessions = async () => (await (await getDb()).getAllFromIndex('sessions', 'startedAt')).reverse();

export const getSession = async (id: string) => (await getDb()).get('sessions', id);

export const getCurrentSession = async () => (await listSessions()).find((session) => !session.endedAt) ?? null;

export const startSession = async (input: { title: string; templateId?: string; exercises: ISessionExercise[] }) => {
  if (await getCurrentSession())
    throw new Error('Une séance est déjà en cours : termine-la avant d’en commencer une autre.');
  const session: ISession = { id: newId(), startedAt: now(), ...input };
  await (await getDb()).add('sessions', session);
  return session;
};

const updateSession = async (id: string, change: (session: ISession) => ISession) => {
  const db = await getDb();
  const tx = db.transaction('sessions', 'readwrite');
  const session = await tx.store.get(id);
  if (!session) throw new Error('Séance introuvable.');
  const next = change(session);
  await tx.store.put(next);
  await tx.done;
  return next;
};

const updateExercise = (id: string, index: number, change: (exercise: ISessionExercise) => ISessionExercise) =>
  updateSession(id, (session) => ({
    ...session,
    exercises: session.exercises.map((exercise, i) => (i === index ? change(exercise) : exercise)),
  }));

export const logSet = (id: string, exerciseIndex: number, set: Omit<ILoggedSet, 'doneAt'>) =>
  updateExercise(id, exerciseIndex, (exercise) => ({
    ...exercise,
    sets: [...exercise.sets, { ...set, doneAt: now() }],
  }));

export const removeLastSet = (id: string, exerciseIndex: number) =>
  updateExercise(id, exerciseIndex, (exercise) => ({ ...exercise, sets: exercise.sets.slice(0, -1) }));

export const addSessionExercise = (id: string, exerciseId: string) =>
  updateSession(id, (session) => ({ ...session, exercises: [...session.exercises, { exerciseId, sets: [] }] }));

export const finishSession = (id: string, summary: { rpe?: number; feeling?: FeelingEnum; notes?: string }) =>
  updateSession(id, (session) => ({ ...session, ...summary, endedAt: now() }));

export const deleteSession = async (id: string) => (await getDb()).delete('sessions', id);
