// Data model of CaliBuddy — see docs/data-model.md. `erasableSyntaxOnly` rules out TS enums: the `…Enum` objects
// below are `as const` maps with a type of the same name.

export const ExerciseFamilyEnum = {
  Push: 'push',
  Pull: 'pull',
  Legs: 'legs',
  Core: 'core',
  Skill: 'skill',
} as const;
export type ExerciseFamilyEnum = (typeof ExerciseFamilyEnum)[keyof typeof ExerciseFamilyEnum];

export const MeasureEnum = {
  Reps: 'reps',
  Hold: 'hold',
} as const;
export type MeasureEnum = (typeof MeasureEnum)[keyof typeof MeasureEnum];

export const FeelingEnum = {
  Great: 'great',
  Ok: 'ok',
  Hard: 'hard',
} as const;
export type FeelingEnum = (typeof FeelingEnum)[keyof typeof FeelingEnum];

export const LevelTestIdEnum = {
  Pull: 'pull',
  Push: 'push',
  Dips: 'dips',
  Core: 'core',
} as const;
export type LevelTestIdEnum = (typeof LevelTestIdEnum)[keyof typeof LevelTestIdEnum];

/** One set as performed. Load in kg (absent or 0 = bodyweight), hold time in seconds. */
export interface ISetValue {
  reps?: number;
  seconds?: number;
  loadKg?: number;
}

/** A goal: in a session template, or as the criterion to pass a progression step. */
export interface ITarget {
  sets: number;
  reps?: number | 'max';
  seconds?: number;
  loadKg?: number;
}

export interface IMistake {
  title: string;
  text: string;
}

export interface IVideo {
  url: string;
  label: string;
  durationSeconds: number;
}

export interface IExercise {
  id: string;
  name: string;
  family: ExerciseFamilyEnum;
  level: 1 | 2 | 3 | 4 | 5;
  measure: MeasureEnum;
  /** Targets and sets are per leg/arm ("3 × 5 / jambe"). */
  unilateral: boolean;
  /** The set logger offers a load stepper. */
  weightable: boolean;
  summary: string;
  cues: string[];
  mistakes: IMistake[];
  muscles: string[];
  equipment: string;
  video?: IVideo;
}

export interface IProgressionStep {
  exerciseId: string;
  criterion: ITarget;
}

export interface IPrerequisite {
  label: string;
  testId: LevelTestIdEnum;
  min: number;
}

export interface IProgression {
  id: string;
  /** « Vers le muscle-up » */
  name: string;
  /** « Muscle-up » — the figure itself. */
  figureName: string;
  family: ExerciseFamilyEnum;
  /** Offered as a goal figure at the end of the level test. */
  figure: boolean;
  description: string;
  prerequisite?: IPrerequisite;
  steps: IProgressionStep[];
}

export interface ILevelTestItem {
  id: LevelTestIdEnum;
  exerciseId: string;
  name: string;
  cues: string[];
}

export type LevelTestResults = Record<LevelTestIdEnum, number>;

export interface ITemplateItem {
  exerciseId: string;
  target: ITarget;
}

// User data, stored by the API (apps/calisthenics-api) and checked against these types there.

export interface IProfile {
  firstName?: string;
  goalProgressionId?: string;
  onboardedAt?: string;
}

export interface ISessionTemplate {
  id: string;
  name: string;
  items: ITemplateItem[];
  createdAt: string;
  updatedAt: string;
}

/** `null` = rest day. */
export type ProgrammeDay = { templateId: string } | null;

export interface IProgramme {
  /** Monday → Sunday. */
  days: ProgrammeDay[];
}

export interface ILoggedSet extends ISetValue {
  rpe?: number;
  doneAt: string;
}

export interface ISessionExercise {
  exerciseId: string;
  target?: ITarget;
  sets: ILoggedSet[];
}

export interface ISession {
  id: string;
  templateId?: string;
  title: string;
  startedAt: string;
  /** Absent while the session is in progress (only one at a time). */
  endedAt?: string;
  rpe?: number;
  feeling?: FeelingEnum;
  notes?: string;
  exercises: ISessionExercise[];
}

export const ProgressSourceEnum = {
  LevelTest: 'level-test',
  Criterion: 'criterion',
  Manual: 'manual',
} as const;
export type ProgressSourceEnum = (typeof ProgressSourceEnum)[keyof typeof ProgressSourceEnum];

export interface IProgressHistoryEntry {
  step: number;
  reachedAt: string;
  source: ProgressSourceEnum;
  sessionId?: string;
}

export interface IProgressionProgress {
  progressionId: string;
  /** 0-based index of the step being worked on; equal to steps.length once the figure is mastered. */
  currentStep: number;
  history: IProgressHistoryEntry[];
}

export interface ILevelTestResult {
  id: string;
  takenAt: string;
  results: LevelTestResults;
}

// Derived values (computed from the user data, never stored).

export const DayStatusEnum = {
  Done: 'done',
  Today: 'today',
  Planned: 'planned',
  Missed: 'missed',
  Rest: 'rest',
} as const;
export type DayStatusEnum = (typeof DayStatusEnum)[keyof typeof DayStatusEnum];

export interface IWeekDay {
  date: Date;
  /** 0 = Monday … 6 = Sunday. */
  dayIndex: number;
  templateId?: string;
  /** A finished session that day, planned or not. */
  sessionId?: string;
  isToday: boolean;
  status: DayStatusEnum;
}

export interface IRecord {
  exerciseId: string;
  set: ISetValue;
  date: string;
  isNew: boolean;
}

export interface IChartPoint {
  label: string;
  value: number;
}

export const StepStatusEnum = {
  Done: 'done',
  Current: 'current',
  Locked: 'locked',
} as const;
export type StepStatusEnum = (typeof StepStatusEnum)[keyof typeof StepStatusEnum];

export const ExerciseStatusEnum = {
  Mastered: 'mastered',
  InProgress: 'in-progress',
  Locked: 'locked',
  Todo: 'todo',
} as const;
export type ExerciseStatusEnum = (typeof ExerciseStatusEnum)[keyof typeof ExerciseStatusEnum];
