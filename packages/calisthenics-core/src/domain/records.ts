import { getExercise } from '../content/exercises';
import { LEVEL_TEST } from '../content/levelTest';
import { addDays, isoWeek, startOfDay, startOfWeek } from './dates';
import { formatMonthShort } from './format';
import { bestSet } from './sets';
import type { IChartPoint, ILevelTestResult, IRecord, ISession, ISetValue } from './types';

const NEW_RECORD_DAYS = 7;

interface IDatedSet extends ISetValue {
  date: string;
}

const withoutDate = ({ reps, seconds, loadKg }: IDatedSet): ISetValue => ({ reps, seconds, loadKg });

const finished = (sessions: ISession[]) => sessions.filter((session) => session.endedAt);

/** Every set of an exercise, from finished sessions and level tests, with its date. */
const datedSets = (sessions: ISession[], levelTests: ILevelTestResult[], exerciseId: string): IDatedSet[] => {
  const fromSessions = finished(sessions).flatMap((session) =>
    session.exercises
      .filter((exercise) => exercise.exerciseId === exerciseId)
      .flatMap((exercise) => exercise.sets.map((set) => ({ ...set, date: set.doneAt }))),
  );
  const test = LEVEL_TEST.find((item) => item.exerciseId === exerciseId);
  const measure = getExercise(exerciseId)?.measure;
  const fromTests = test
    ? levelTests.map((result) => ({
        ...(measure === 'hold' ? { seconds: result.results[test.id] } : { reps: result.results[test.id] }),
        date: result.takenAt,
      }))
    : [];
  return [...fromSessions, ...fromTests];
};

/** Best set per exercise, newest records first. */
export const personalRecords = (sessions: ISession[], levelTests: ILevelTestResult[], now: Date): IRecord[] => {
  const exerciseIds = new Set(finished(sessions).flatMap((session) => session.exercises.map((e) => e.exerciseId)));
  for (const item of LEVEL_TEST) if (levelTests.length) exerciseIds.add(item.exerciseId);
  const newSince = addDays(startOfDay(now), -NEW_RECORD_DAYS).getTime();

  return [...exerciseIds]
    .map((exerciseId) => {
      const sets = datedSets(sessions, levelTests, exerciseId);
      // On ties, the earliest set holds the record.
      const best = bestSet([...sets].sort((a, b) => a.date.localeCompare(b.date)));
      if (!best || (!best.reps && !best.seconds)) return undefined;
      return { exerciseId, set: withoutDate(best), date: best.date, isNew: new Date(best.date).getTime() >= newSince };
    })
    .filter((record): record is IRecord => record !== undefined)
    .sort((a, b) => b.date.localeCompare(a.date));
};

/** Best set of an exercise between two dates (inclusive start, exclusive end). */
export const bestBetween = (
  sessions: ISession[],
  levelTests: ILevelTestResult[],
  exerciseId: string,
  from: Date,
  to: Date,
): ISetValue | undefined => {
  const sets = datedSets(sessions, levelTests, exerciseId).filter((set) => {
    const time = new Date(set.date).getTime();
    return time >= from.getTime() && time < to.getTime();
  });
  const best = bestSet(sets);
  return best && withoutDate(best);
};

/** Total reps per week (holds excluded), oldest week first: « S36 » → 210. */
export const weeklyVolume = (sessions: ISession[], now: Date, weeks = 8): IChartPoint[] => {
  const thisWeek = startOfWeek(now);
  return Array.from({ length: weeks }, (_, index) => {
    const from = addDays(thisWeek, -7 * (weeks - 1 - index));
    const to = addDays(from, 7);
    const value = finished(sessions)
      .filter((session) => {
        const time = new Date(session.startedAt).getTime();
        return time >= from.getTime() && time < to.getTime();
      })
      .flatMap((session) => session.exercises.flatMap((exercise) => exercise.sets))
      .reduce((total, set) => total + (set.reps ?? 0), 0);
    return { label: `S${isoWeek(from)}`, value };
  });
};

/** Best reps (or seconds) of an exercise per month, oldest month first. */
export const monthlyBest = (
  sessions: ISession[],
  levelTests: ILevelTestResult[],
  exerciseId: string,
  now: Date,
  months = 6,
): IChartPoint[] =>
  Array.from({ length: months }, (_, index) => {
    const from = new Date(now.getFullYear(), now.getMonth() - (months - 1 - index), 1);
    const to = new Date(from.getFullYear(), from.getMonth() + 1, 1);
    const best = bestBetween(sessions, levelTests, exerciseId, from, to);
    return { label: formatMonthShort(from), value: best?.seconds ?? best?.reps ?? 0 };
  });
