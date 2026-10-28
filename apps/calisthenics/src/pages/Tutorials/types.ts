import type { ExerciseFamilyEnum } from '../../domain/types';

export interface IFamilyTab {
  id: ExerciseFamilyEnum | 'all';
  label: string;
}
