import type { IExercise } from '../../domain/types';

export interface ISetEntry {
  value: number;
  loadKg: number;
  rpe?: number;
}

export interface ISetLogger {
  exercise: IExercise;
  setNumber: number;
  /** Already logged sets of this exercise, formatted. */
  previous: string[];
  /** Pre-filled values (previous set, or the target). Remount the logger (key) to reset them. */
  initial: ISetEntry;
  target?: string;
  restClock?: string;
  pending?: boolean;
  onValidate: (entry: ISetEntry) => void;
  onUndo?: () => void;
  onNext?: () => void;
}
