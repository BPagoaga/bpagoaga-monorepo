import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import type { ExerciseStatusEnum, IExercise } from '@bpagoaga/calisthenics-core/domain/types';
import type { BadgeTone } from '../Badge';

export interface IStatusMeta {
  label: string;
  tone: BadgeTone;
  icon: IconDefinition;
}

export interface IExerciseCard {
  exercise: IExercise;
  status: ExerciseStatusEnum;
  target?: string;
  /** « 3/6 » when the exercise is a progression step. */
  step?: string;
  to: string;
}
