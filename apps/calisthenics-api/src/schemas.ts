import { getExercise } from '@bpagoaga/calisthenics-core/content/exercises';
import { getProgression } from '@bpagoaga/calisthenics-core/content/progressions';
import type {
  ILevelTestResult,
  ILoggedSet,
  IProfile,
  IProgramme,
  IProgressionProgress,
  ISession,
  ISessionTemplate,
  ITarget,
  ITemplateItem,
} from '@bpagoaga/calisthenics-core/domain/types';
import { z } from '@hono/zod-openapi';

// Request and response schemas, registered as OpenAPI components (`.openapi('Name')`): the generated client's models
// are named after them. Each response schema `satisfies` its core type, so the API cannot drift from the domain.

const isoDate = z.iso.datetime().openapi({ example: '2026-10-23T18:42:00.000Z' });

const exerciseId = z
  .string()
  .refine((id) => getExercise(id) !== undefined, { message: 'Exercice inconnu.' })
  .openapi({ example: 'traction-stricte' });

const progressionId = z
  .string()
  .refine((id) => getProgression(id) !== undefined, { message: 'Progression inconnue.' })
  .openapi({ example: 'muscle-up' });

export const ErrorSchema = z
  .object({ message: z.string().openapi({ example: 'Séance introuvable.' }) })
  .openapi('ErrorResponse');

export const TargetSchema = z
  .object({
    sets: z.number().int().positive(),
    reps: z.union([z.number().int().nonnegative(), z.literal('max')]).optional(),
    seconds: z.number().int().nonnegative().optional(),
    loadKg: z.number().nonnegative().optional(),
  })
  .openapi('Target') satisfies z.ZodType<ITarget>;

export const TemplateItemSchema = z
  .object({ exerciseId, target: TargetSchema })
  .openapi('TemplateItem') satisfies z.ZodType<ITemplateItem>;

// Profile

export const ProfileSchema = z
  .object({
    firstName: z.string().optional(),
    goalProgressionId: z.string().optional(),
    onboardedAt: isoDate.optional(),
  })
  .openapi('Profile') satisfies z.ZodType<IProfile>;

export const ProfileUpdateSchema = z
  .object({
    firstName: z.string().trim().min(1).max(60).optional(),
    goalProgressionId: progressionId.optional(),
    onboardedAt: isoDate.optional(),
  })
  .openapi('ProfileUpdate');

// Templates

export const TemplateSchema = z
  .object({
    id: z.uuid(),
    name: z.string(),
    items: z.array(TemplateItemSchema),
    createdAt: isoDate,
    updatedAt: isoDate,
  })
  .openapi('Template') satisfies z.ZodType<ISessionTemplate>;

export const TemplateInputSchema = z
  .object({
    name: z.string().trim().min(1, 'Donne un nom au modèle.').max(80),
    items: z.array(TemplateItemSchema).max(30),
  })
  .openapi('TemplateInput');

// Programme

export const ProgrammeSchema = z
  .object({
    days: z.array(z.object({ templateId: z.uuid() }).nullable()).length(7),
  })
  .openapi('Programme') satisfies z.ZodType<IProgramme>;

export const ProgrammeDayInputSchema = z
  .object({ templateId: z.uuid().nullable().openapi({ description: '`null` = rest day.' }) })
  .openapi('ProgrammeDayInput');

// Sessions

const rpe = z.number().int().min(1).max(10);

export const LoggedSetSchema = z
  .object({
    reps: z.number().int().nonnegative().optional(),
    seconds: z.number().int().nonnegative().optional(),
    loadKg: z.number().nonnegative().optional(),
    rpe: rpe.optional(),
    doneAt: isoDate,
  })
  .openapi('LoggedSet') satisfies z.ZodType<ILoggedSet>;

export const SetInputSchema = LoggedSetSchema.omit({ doneAt: true }).openapi('SetInput');

export const SessionExerciseSchema = z
  .object({ exerciseId, target: TargetSchema.optional(), sets: z.array(LoggedSetSchema) })
  .openapi('SessionExercise');

export const FeelingSchema = z.enum(['great', 'ok', 'hard']).openapi('Feeling');

export const SessionSchema = z
  .object({
    id: z.uuid(),
    templateId: z.uuid().optional(),
    title: z.string(),
    startedAt: isoDate,
    endedAt: isoDate.optional(),
    rpe: rpe.optional(),
    feeling: FeelingSchema.optional(),
    notes: z.string().optional(),
    exercises: z.array(SessionExerciseSchema),
  })
  .openapi('Session') satisfies z.ZodType<ISession>;

export const SessionStartSchema = z
  .object({
    title: z.string().trim().min(1).max(80),
    templateId: z.uuid().optional(),
    exercises: z.array(SessionExerciseSchema.omit({ sets: true })).max(30),
  })
  .openapi('SessionStart');

export const SessionExerciseInputSchema = z.object({ exerciseId }).openapi('SessionExerciseInput');

export const SessionFinishSchema = z
  .object({ rpe: rpe.optional(), feeling: FeelingSchema.optional(), notes: z.string().max(2000).optional() })
  .openapi('SessionFinish');

// Progress and level tests

export const ProgressSourceSchema = z.enum(['level-test', 'criterion', 'manual']).openapi('ProgressSource');

export const ProgressSchema = z
  .object({
    progressionId: z.string(),
    currentStep: z.number().int().nonnegative(),
    history: z.array(
      z.object({
        step: z.number().int().nonnegative(),
        reachedAt: isoDate,
        source: ProgressSourceSchema,
        sessionId: z.uuid().optional(),
      }),
    ),
  })
  .openapi('Progress') satisfies z.ZodType<IProgressionProgress>;

export const ProgressStepInputSchema = z
  .object({ step: z.number().int().nonnegative(), source: ProgressSourceSchema, sessionId: z.uuid().optional() })
  .openapi('ProgressStepInput');

export const LevelTestResultsSchema = z
  .object({
    pull: z.number().int().nonnegative(),
    push: z.number().int().nonnegative(),
    dips: z.number().int().nonnegative(),
    core: z.number().int().nonnegative().openapi({ description: 'Hollow body hold, in seconds.' }),
  })
  .openapi('LevelTestResults');

export const LevelTestSchema = z
  .object({ id: z.uuid(), takenAt: isoDate, results: LevelTestResultsSchema })
  .openapi('LevelTest') satisfies z.ZodType<ILevelTestResult>;

export const LevelTestInputSchema = z.object({ results: LevelTestResultsSchema }).openapi('LevelTestInput');

// Backup: the format of the former local exports (IndexedDB), so an old file imports into an account.

const legacyId = z.string().min(1);

export const BackupSchema = z
  .object({
    app: z.literal('calibuddy'),
    schemaVersion: z.literal(1),
    exportedAt: isoDate,
    data: z.object({
      profile: z.array(ProfileSchema.extend({ id: z.literal('me').optional() })).max(1),
      templates: z.array(TemplateSchema.extend({ id: legacyId })),
      programme: z.array(
        z.object({
          id: z.literal('current').optional(),
          days: z.array(z.object({ templateId: legacyId }).nullable()).length(7),
        }),
      ),
      sessions: z.array(SessionSchema.extend({ id: legacyId, templateId: legacyId.optional() })),
      progress: z.array(
        ProgressSchema.extend({
          history: z.array(ProgressSchema.shape.history.element.extend({ sessionId: legacyId.optional() })),
        }),
      ),
      levelTests: z.array(LevelTestSchema.extend({ id: legacyId })),
    }),
  })
  .openapi('Backup');

export type Backup = z.infer<typeof BackupSchema>;

// Path parameters

export const TemplateParamsSchema = z.object({
  templateId: z.uuid().openapi({ param: { name: 'templateId', in: 'path' } }),
});
export const SessionParamsSchema = z.object({
  sessionId: z.uuid().openapi({ param: { name: 'sessionId', in: 'path' } }),
});
export const SessionExerciseParamsSchema = SessionParamsSchema.extend({
  exerciseIndex: z.coerce
    .number()
    .int()
    .nonnegative()
    // `z.coerce` reads as optional to the OpenAPI generator: path parameters are always required.
    .openapi({ param: { name: 'exerciseIndex', in: 'path', required: true }, type: 'integer', minimum: 0 }),
});
export const DayParamsSchema = z.object({
  dayIndex: z.coerce
    .number()
    .int()
    .min(0)
    .max(6)
    .openapi({
      param: { name: 'dayIndex', in: 'path', required: true },
      type: 'integer',
      minimum: 0,
      maximum: 6,
      description: '0 = Monday … 6 = Sunday.',
    }),
});
export const ProgressionParamsSchema = z.object({
  progressionId: progressionId.openapi({ param: { name: 'progressionId', in: 'path' } }),
});
