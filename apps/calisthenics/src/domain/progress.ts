import { findStep } from '../content/progressions';
import type { ExerciseStatusEnum, IProgression, IProgressionProgress, ISession, StepStatusEnum } from './types';

export const currentStepOf = (progressionId: string, progress: IProgressionProgress[]) =>
  progress.find((entry) => entry.progressionId === progressionId)?.currentStep ?? 0;

export const stepStatus = (stepIndex: number, currentStep: number): StepStatusEnum =>
  stepIndex < currentStep ? 'done' : stepIndex === currentStep ? 'current' : 'locked';

/** Status of an exercise in the library: from its progression step, or from the journal when it has none. */
export const exerciseStatus = (
  exerciseId: string,
  progress: IProgressionProgress[],
  sessions: ISession[],
): ExerciseStatusEnum => {
  const step = findStep(exerciseId);
  if (step) {
    const status = stepStatus(step.index, currentStepOf(step.progression.id, progress));
    return status === 'done' ? 'mastered' : status === 'current' ? 'in-progress' : 'locked';
  }
  const practised = sessions.some((session) =>
    session.exercises.some((exercise) => exercise.exerciseId === exerciseId),
  );
  return practised ? 'in-progress' : 'todo';
};

/** Share of a progression's steps already validated, 0–100. */
export const progressionPercent = (progression: IProgression, progress: IProgressionProgress[]) =>
  Math.round(
    (Math.min(currentStepOf(progression.id, progress), progression.steps.length) / progression.steps.length) * 100,
  );
