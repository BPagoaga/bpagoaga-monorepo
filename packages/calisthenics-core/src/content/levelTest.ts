import type { ILevelTestItem } from '../domain/types';

export const LEVEL_TEST: ILevelTestItem[] = [
  {
    id: 'pull',
    exerciseId: 'traction-stricte',
    name: 'Tractions',
    cues: [
      'Prise pronation, bras tendus en bas.',
      'Menton au-dessus de la barre en haut.',
      'Aucun élan : une répétition balancée ne compte pas.',
    ],
  },
  {
    id: 'push',
    exerciseId: 'pompe',
    name: 'Pompes',
    cues: [
      'Corps gainé, des talons à la tête.',
      'Poitrine à un poing du sol en bas.',
      'Bras tendus en haut, sans pause au sol.',
    ],
  },
  {
    id: 'dips',
    exerciseId: 'dips',
    name: 'Dips',
    cues: [
      'Aux barres parallèles ou entre deux chaises stables.',
      'Épaules au niveau des coudes en bas.',
      'Bras tendus en haut.',
    ],
  },
  {
    id: 'core',
    exerciseId: 'hollow-body-hold',
    name: 'Hollow body hold',
    cues: [
      'Allongé sur le dos, bras et jambes tendus.',
      'Bas du dos plaqué au sol.',
      'Arrête le chrono dès que le dos décolle.',
    ],
  },
];
