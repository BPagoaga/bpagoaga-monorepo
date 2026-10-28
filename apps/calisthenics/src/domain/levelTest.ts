import { PROGRESSIONS } from '../content/progressions';
import type { IProgression, LevelTestResults } from './types';

type Rule = (results: LevelTestResults) => number;

// Thresholds from docs/data-model.md (« Seuils du test de niveau »). Progressions without a rule start at step 0.
const RULES: Record<string, Rule> = {
  'muscle-up': ({ pull }) => (pull === 0 ? 0 : pull < 5 ? 1 : pull < 12 ? 2 : 3),
  hspu: ({ push, dips }) => {
    if (push < 5) return 0;
    if (push >= 40 && dips >= 20) return 3;
    if (push >= 20 && dips >= 10) return 2;
    return 1;
  },
  'l-sit': ({ core }) => (core < 20 ? 0 : core < 60 ? 1 : 2),
  'front-lever': ({ pull }) => (pull >= 12 ? 1 : 0),
};

/** Starting step (0-based) of every progression after a level test. */
export const placements = (results: LevelTestResults): Record<string, number> =>
  Object.fromEntries(PROGRESSIONS.map((progression) => [progression.id, RULES[progression.id]?.(results) ?? 0]));

export const isFigureLocked = (progression: IProgression, results: LevelTestResults | undefined) =>
  !!progression.prerequisite && (results?.[progression.prerequisite.testId] ?? 0) < progression.prerequisite.min;

/** The suggested goal: muscle-up once strict pull-ups are there, handstand otherwise. */
export const recommendedFigure = (results: LevelTestResults) => (results.pull >= 5 ? 'muscle-up' : 'handstand');
