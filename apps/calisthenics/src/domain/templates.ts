import { getExercise } from '../content/exercises';
import { formatDuration, formatTarget } from './format';
import type { ExerciseFamilyEnum, IProgramme, ITemplateItem } from './types';

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
/** Rough time per set, rest included. */
const SECONDS_PER_SET = 150;

export const itemLines = (items: ITemplateItem[]) =>
  items.map((item) => {
    const exercise = getExercise(item.exerciseId);
    return { name: exercise?.name ?? item.exerciseId, detail: formatTarget(item.target, exercise) };
  });

/** The family with the most exercises in the template. */
export const dominantFamily = (items: ITemplateItem[]): ExerciseFamilyEnum | undefined => {
  const counts = new Map<ExerciseFamilyEnum, number>();
  for (const item of items) {
    const family = getExercise(item.exerciseId)?.family;
    if (family) counts.set(family, (counts.get(family) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
};

export const estimatedDuration = (items: ITemplateItem[]) =>
  formatDuration(items.reduce((total, item) => total + item.target.sets, 0) * SECONDS_PER_SET * 1000);

/** « Mar, Jeu » — days of the week a template is scheduled on. */
export const scheduledDays = (templateId: string, programme: IProgramme | undefined) =>
  (programme?.days ?? []).flatMap((day, index) => (day?.templateId === templateId ? [DAY_NAMES[index]] : []));

export const templateSubtitle = (items: ITemplateItem[], days: string[]) =>
  [
    `${items.length} exercice${items.length > 1 ? 's' : ''}`,
    estimatedDuration(items),
    ...(days.length ? [days.join(', ')] : []),
  ].join(' · ');
