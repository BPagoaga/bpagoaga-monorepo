import type { ITemplateItem } from '../domain/types';

/** Session templates created with the database, so the programme is never empty on first launch. */
export const DEFAULT_TEMPLATES: { name: string; items: ITemplateItem[] }[] = [
  {
    name: 'Tirage + gainage',
    items: [
      { exerciseId: 'traction-stricte', target: { sets: 4, reps: 'max' } },
      { exerciseId: 'traction-explosive', target: { sets: 3, reps: 5 } },
      { exerciseId: 'rowing-australien', target: { sets: 3, reps: 12 } },
      { exerciseId: 'l-sit-groupe', target: { sets: 3, seconds: 20 } },
    ],
  },
  {
    name: 'Poussée + jambes',
    items: [
      { exerciseId: 'dips', target: { sets: 3, reps: 15 } },
      { exerciseId: 'pike-push-up', target: { sets: 3, reps: 8 } },
      { exerciseId: 'pistol-squat-assiste', target: { sets: 3, reps: 5 } },
      { exerciseId: 'hollow-body-hold', target: { sets: 3, seconds: 30 } },
    ],
  },
  {
    name: 'Figures + tirage lesté',
    items: [
      { exerciseId: 'traction-lestee', target: { sets: 3, reps: 5, loadKg: 10 } },
      { exerciseId: 'front-lever-groupe', target: { sets: 3, seconds: 15 } },
      { exerciseId: 'handstand-mur-dos', target: { sets: 5, seconds: 30 } },
    ],
  },
];
