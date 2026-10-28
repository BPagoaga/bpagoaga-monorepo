import type { IProgression } from '../domain/types';

export const PROGRESSIONS: IProgression[] = [
  {
    id: 'muscle-up',
    name: 'Vers le muscle-up',
    figureName: 'Muscle-up',
    family: 'pull',
    figure: true,
    description: 'Tirage + transition au-dessus de la barre',
    steps: [
      { exerciseId: 'rowing-australien', criterion: { sets: 3, reps: 12 } },
      { exerciseId: 'traction-negative', criterion: { sets: 3, reps: 5 } },
      { exerciseId: 'traction-stricte', criterion: { sets: 3, reps: 8 } },
      { exerciseId: 'traction-explosive', criterion: { sets: 3, reps: 5 } },
      { exerciseId: 'muscle-up-assiste', criterion: { sets: 3, reps: 3 } },
      { exerciseId: 'muscle-up', criterion: { sets: 1, reps: 1 } },
    ],
  },
  {
    id: 'front-lever',
    name: 'Vers le front lever',
    figureName: 'Front lever',
    family: 'skill',
    figure: true,
    description: 'Corps à l’horizontale sous la barre',
    steps: [
      { exerciseId: 'front-lever-groupe', criterion: { sets: 3, seconds: 15 } },
      { exerciseId: 'front-lever-groupe-avance', criterion: { sets: 3, seconds: 15 } },
      { exerciseId: 'front-lever-une-jambe', criterion: { sets: 3, seconds: 10 } },
      { exerciseId: 'front-lever', criterion: { sets: 3, seconds: 5 } },
    ],
  },
  {
    id: 'handstand',
    name: 'Vers le handstand libre',
    figureName: 'Handstand libre',
    family: 'skill',
    figure: true,
    description: 'Équilibre sur les mains, sans mur',
    steps: [
      { exerciseId: 'handstand-mur-dos', criterion: { sets: 3, seconds: 30 } },
      { exerciseId: 'handstand-mur-ventre', criterion: { sets: 3, seconds: 45 } },
      { exerciseId: 'handstand-libre', criterion: { sets: 5, seconds: 10 } },
    ],
  },
  {
    id: 'planche',
    name: 'Vers la planche',
    figureName: 'Planche',
    family: 'skill',
    figure: true,
    description: 'Corps à l’horizontale, en appui sur les mains',
    prerequisite: { label: '20 dips', testId: 'dips', min: 20 },
    steps: [
      { exerciseId: 'planche-lean', criterion: { sets: 3, seconds: 20 } },
      { exerciseId: 'planche-groupee', criterion: { sets: 3, seconds: 10 } },
      { exerciseId: 'planche-groupee-avancee', criterion: { sets: 3, seconds: 10 } },
    ],
  },
  {
    id: 'hspu',
    name: 'Vers le handstand push-up',
    figureName: 'Handstand push-up',
    family: 'push',
    figure: false,
    description: 'De la pompe à la pompe verticale',
    steps: [
      { exerciseId: 'pompe-inclinee', criterion: { sets: 3, reps: 12 } },
      { exerciseId: 'pompe', criterion: { sets: 3, reps: 15 } },
      { exerciseId: 'pike-push-up', criterion: { sets: 3, reps: 8 } },
      { exerciseId: 'pike-push-up-sureleve', criterion: { sets: 3, reps: 8 } },
      { exerciseId: 'hspu-negatif', criterion: { sets: 3, reps: 5 } },
      { exerciseId: 'hspu-mur', criterion: { sets: 3, reps: 5 } },
    ],
  },
  {
    id: 'l-sit',
    name: 'Vers le L-sit',
    figureName: 'L-sit',
    family: 'core',
    figure: false,
    description: 'Du gainage au sol au L-sit',
    steps: [
      { exerciseId: 'hollow-body-hold', criterion: { sets: 3, seconds: 30 } },
      { exerciseId: 'l-sit-groupe', criterion: { sets: 3, seconds: 15 } },
      { exerciseId: 'l-sit-une-jambe', criterion: { sets: 3, seconds: 15 } },
      { exerciseId: 'l-sit', criterion: { sets: 3, seconds: 20 } },
    ],
  },
  {
    id: 'pistol',
    name: 'Vers le pistol squat',
    figureName: 'Pistol squat',
    family: 'legs',
    figure: false,
    description: 'Du squat au squat sur une jambe',
    steps: [
      { exerciseId: 'squat', criterion: { sets: 3, reps: 20 } },
      { exerciseId: 'squat-bulgare', criterion: { sets: 3, reps: 10 } },
      { exerciseId: 'pistol-squat-assiste', criterion: { sets: 3, reps: 5 } },
      { exerciseId: 'pistol-squat', criterion: { sets: 3, reps: 5 } },
    ],
  },
];

const BY_ID = new Map(PROGRESSIONS.map((progression) => [progression.id, progression]));

export const getProgression = (id: string) => BY_ID.get(id);

/** The progression an exercise belongs to, with its step index. An exercise is in at most one progression. */
export const findStep = (exerciseId: string) => {
  for (const progression of PROGRESSIONS) {
    const index = progression.steps.findIndex((step) => step.exerciseId === exerciseId);
    if (index !== -1) return { progression, index };
  }
  return undefined;
};
