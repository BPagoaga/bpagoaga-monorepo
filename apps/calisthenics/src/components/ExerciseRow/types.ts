import type { ReactNode } from 'react';
import type { ExerciseFamilyEnum } from '@bpagoaga/calisthenics-core/domain/types';

export interface IExerciseRow {
  name: string;
  family: ExerciseFamilyEnum;
  detail?: string;
  /** Summary / edit modes. */
  onRemove?: () => void;
  /** Pick mode: toggle button Ajouter / Ajouté. */
  picked?: boolean;
  onTogglePick?: () => void;
  /** Edit mode: target fields, and keyboard-accessible reordering (no drag-only interaction). */
  editor?: ReactNode;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}
