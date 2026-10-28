import type { IProgramme } from '../domain/types';
import { getDb } from './schema';

const EMPTY: IProgramme = { id: 'current', days: [null, null, null, null, null, null, null] };

export const getProgramme = async () => (await (await getDb()).get('programme', 'current')) ?? EMPTY;

/** `templateId` null = rest day. */
export const setProgrammeDay = async (dayIndex: number, templateId: string | null) => {
  const programme = await getProgramme();
  const days = programme.days.map((day, index) => (index === dayIndex ? (templateId ? { templateId } : null) : day));
  const next = { ...programme, days };
  await (await getDb()).put('programme', next);
  return next;
};
