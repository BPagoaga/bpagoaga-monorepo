import { z } from 'zod';
import { getDb, SCHEMA_VERSION } from './schema';
import type { StoreName } from './types';

const STORES: StoreName[] = ['profile', 'templates', 'programme', 'sessions', 'progress', 'levelTests'];

const target = z.object({
  sets: z.number().int().positive(),
  reps: z.union([z.number().nonnegative(), z.literal('max')]).optional(),
  seconds: z.number().nonnegative().optional(),
  loadKg: z.number().nonnegative().optional(),
});
const isoDate = z.iso.datetime();
const loggedSet = z.object({
  reps: z.number().nonnegative().optional(),
  seconds: z.number().nonnegative().optional(),
  loadKg: z.number().nonnegative().optional(),
  rpe: z.number().min(1).max(10).optional(),
  doneAt: isoDate,
});

const backupSchema = z.object({
  app: z.literal('calibuddy'),
  schemaVersion: z.number().int().positive().max(SCHEMA_VERSION),
  exportedAt: isoDate,
  data: z.object({
    profile: z.array(
      z.object({
        id: z.literal('me'),
        firstName: z.string().optional(),
        goalProgressionId: z.string().optional(),
        onboardedAt: isoDate.optional(),
      }),
    ),
    templates: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        items: z.array(z.object({ exerciseId: z.string(), target })),
        createdAt: isoDate,
        updatedAt: isoDate,
      }),
    ),
    programme: z.array(
      z.object({ id: z.literal('current'), days: z.array(z.object({ templateId: z.string() }).nullable()).length(7) }),
    ),
    sessions: z.array(
      z.object({
        id: z.string(),
        templateId: z.string().optional(),
        title: z.string(),
        startedAt: isoDate,
        endedAt: isoDate.optional(),
        rpe: z.number().min(1).max(10).optional(),
        feeling: z.enum(['great', 'ok', 'hard']).optional(),
        notes: z.string().optional(),
        exercises: z.array(z.object({ exerciseId: z.string(), target: target.optional(), sets: z.array(loggedSet) })),
      }),
    ),
    progress: z.array(
      z.object({
        progressionId: z.string(),
        currentStep: z.number().int().nonnegative(),
        history: z.array(
          z.object({
            step: z.number().int().nonnegative(),
            reachedAt: isoDate,
            source: z.enum(['level-test', 'criterion', 'manual']),
            sessionId: z.string().optional(),
          }),
        ),
      }),
    ),
    levelTests: z.array(
      z.object({
        id: z.string(),
        takenAt: isoDate,
        results: z.object({ pull: z.number(), push: z.number(), dips: z.number(), core: z.number() }),
      }),
    ),
  }),
});

export type Backup = z.infer<typeof backupSchema>;

export const exportData = async (): Promise<Backup> => {
  const db = await getDb();
  const entries = await Promise.all(STORES.map(async (store) => [store, await db.getAll(store)] as const));
  return {
    app: 'calibuddy',
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    data: Object.fromEntries(entries) as Backup['data'],
  };
};

/** Parses a backup file; throws a French, user-facing message when it isn't one. */
export const parseBackup = (json: string): Backup => {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    throw new Error('Ce fichier n’est pas un export CaliBuddy (JSON illisible).');
  }
  const result = backupSchema.safeParse(raw);
  if (!result.success)
    throw new Error('Ce fichier n’est pas un export CaliBuddy valide, ou il vient d’une version plus récente.');
  return result.data;
};

/** Replaces every store with the backup's content, all or nothing. */
export const importData = async (backup: Backup) => {
  const db = await getDb();
  const tx = db.transaction(STORES, 'readwrite');
  await Promise.all(STORES.map((store) => tx.objectStore(store).clear()));
  for (const value of backup.data.profile) await tx.objectStore('profile').put(value);
  for (const value of backup.data.templates) await tx.objectStore('templates').put(value);
  for (const value of backup.data.programme) await tx.objectStore('programme').put(value);
  for (const value of backup.data.sessions) await tx.objectStore('sessions').put(value);
  for (const value of backup.data.progress) await tx.objectStore('progress').put(value);
  for (const value of backup.data.levelTests) await tx.objectStore('levelTests').put(value);
  await tx.done;
};
