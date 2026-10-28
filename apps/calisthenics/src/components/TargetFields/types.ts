import type { IExercise, ITarget } from '@bpagoaga/calisthenics-core/domain/types';

export interface ITargetFields {
  idPrefix: string;
  exercise: IExercise;
  target: ITarget;
  onChange: (target: ITarget) => void;
}
