import type { ISessionExercise, ISetValue, ITarget } from './types';

/** Positive when `a` is better: heavier first, then more reps / longer hold. */
export const compareSets = (a: ISetValue, b: ISetValue) =>
  (a.loadKg ?? 0) - (b.loadKg ?? 0) || (a.seconds ?? 0) - (b.seconds ?? 0) || (a.reps ?? 0) - (b.reps ?? 0);

export const bestSet = <T extends ISetValue>(sets: T[]): T | undefined =>
  sets.reduce<T | undefined>((best, set) => (!best || compareSets(set, best) > 0 ? set : best), undefined);

/** A set reaches a target when every measured dimension is at least the target's ('max' = any effort). */
export const setMeetsTarget = (set: ISetValue, target: ITarget) => {
  if (target.seconds !== undefined && (set.seconds ?? 0) < target.seconds) return false;
  if (typeof target.reps === 'number' && (set.reps ?? 0) < target.reps) return false;
  if (target.loadKg !== undefined && (set.loadKg ?? 0) < target.loadKg) return false;
  return true;
};

/** The criterion is met when enough sets of the exercise, in a single session, reach the target. */
export const meetsCriterion = (exercise: Pick<ISessionExercise, 'sets'>, criterion: ITarget) =>
  exercise.sets.filter((set) => setMeetsTarget(set, criterion)).length >= criterion.sets;
