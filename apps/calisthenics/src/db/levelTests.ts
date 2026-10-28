import { placements } from '../domain/levelTest';
import type { ILevelTestResult, LevelTestResults } from '../domain/types';
import { getDb, newId, now } from './schema';

/** Newest first. */
export const listLevelTests = async () => (await (await getDb()).getAllFromIndex('levelTests', 'takenAt')).reverse();

/** Saves the results and places every progression at its starting step, in one transaction. */
export const saveLevelTest = async (results: LevelTestResults) => {
  const db = await getDb();
  const takenAt = now();
  const test: ILevelTestResult = { id: newId(), takenAt, results };
  const tx = db.transaction(['levelTests', 'progress'], 'readwrite');
  await tx.objectStore('levelTests').add(test);
  for (const [progressionId, step] of Object.entries(placements(results))) {
    const current = await tx.objectStore('progress').get(progressionId);
    await tx.objectStore('progress').put({
      progressionId,
      currentStep: step,
      history: [...(current?.history ?? []), { step, reachedAt: takenAt, source: 'level-test' }],
    });
  }
  await tx.done;
  return test;
};
