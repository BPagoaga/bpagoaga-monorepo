import type { ExerciseFamilyEnum } from '@bpagoaga/calisthenics-core/domain/types';

export interface IFamilyTab {
  id: ExerciseFamilyEnum | 'all';
  label: string;
}
