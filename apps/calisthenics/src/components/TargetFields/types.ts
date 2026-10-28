import type { IExercise, ITarget } from '../../domain/types';

export interface ITargetFields {
  idPrefix: string;
  exercise: IExercise;
  target: ITarget;
  onChange: (target: ITarget) => void;
}
