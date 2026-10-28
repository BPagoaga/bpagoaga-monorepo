import type { IProgressionProgress, ProgressSourceEnum } from '../domain/types';
import { getDb, now } from './schema';

export const listProgress = async () => (await getDb()).getAll('progress');

export const setProgressStep = async (
  progressionId: string,
  step: number,
  source: ProgressSourceEnum,
  sessionId?: string,
) => {
  const db = await getDb();
  const current = await db.get('progress', progressionId);
  const entry: IProgressionProgress = {
    progressionId,
    currentStep: step,
    history: [...(current?.history ?? []), { step, reachedAt: now(), source, sessionId }],
  };
  await db.put('progress', entry);
  return entry;
};
