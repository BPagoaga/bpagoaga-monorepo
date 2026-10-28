import { randomUUID } from 'node:crypto';
import { createRoute } from '@hono/zod-openapi';
import { asc, eq } from 'drizzle-orm';
import { schema } from '../db';
import { toLevelTest, toProgramme, toProgress, toSession, toTemplate } from '../mappers';
import { createRouter, errorResponses, jsonBody, jsonContent, noContent } from '../router';
import { type Backup, BackupSchema } from '../schemas';
import type { IAppDeps } from '../types';

const tags = ['Backup'];

const exportData = createRoute({
  operationId: 'exportData',
  tags,
  method: 'get',
  path: '/backup',
  responses: { 200: jsonContent(BackupSchema, 'Everything the user has logged, as a JSON file'), ...errorResponses },
});

const importData = createRoute({
  operationId: 'importData',
  tags,
  description:
    'Replaces all of the user’s data with a backup, all or nothing. Accepts the exports of the former local-only app.',
  method: 'put',
  path: '/backup',
  request: jsonBody(BackupSchema),
  responses: { ...noContent, ...errorResponses },
});

const INVALID_BACKUP = 'Ce fichier n’est pas un export CaliBuddy valide, ou il vient d’une version plus récente.';

export const backupRoutes = ({ db }: IAppDeps) => {
  const router = createRouter();

  router.openapi(exportData, async (c) => {
    const userId = c.var.userId;
    const [[user], [profile], templates, days, sessions, progress, levelTests] = await Promise.all([
      db.select({ name: schema.user.name }).from(schema.user).where(eq(schema.user.id, userId)),
      db.select().from(schema.profiles).where(eq(schema.profiles.userId, userId)),
      db
        .select()
        .from(schema.templates)
        .where(eq(schema.templates.userId, userId))
        .orderBy(asc(schema.templates.createdAt)),
      db.select().from(schema.programmeDays).where(eq(schema.programmeDays.userId, userId)),
      db
        .select()
        .from(schema.sessions)
        .where(eq(schema.sessions.userId, userId))
        .orderBy(asc(schema.sessions.startedAt)),
      db.select().from(schema.progress).where(eq(schema.progress.userId, userId)),
      db
        .select()
        .from(schema.levelTests)
        .where(eq(schema.levelTests.userId, userId))
        .orderBy(asc(schema.levelTests.takenAt)),
    ]);
    const backup: Backup = {
      app: 'calibuddy',
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      data: {
        profile: [
          {
            firstName: user?.name || undefined,
            goalProgressionId: profile?.goalProgressionId ?? undefined,
            onboardedAt: profile?.onboardedAt?.toISOString(),
          },
        ],
        templates: templates.map(toTemplate),
        programme: [toProgramme(days)],
        sessions: sessions.map(toSession),
        progress: progress.map(toProgress),
        levelTests: levelTests.map(toLevelTest),
      },
    };
    return c.json(backup, 200);
  });

  router.openapi(
    importData,
    async (c) => {
      const { data } = c.req.valid('json');
      const userId = c.var.userId;
      // Fresh ids: a file can be imported into several accounts, and old local ids weren't always UUIDs.
      const templateIds = new Map(data.templates.map((template) => [template.id, randomUUID()]));
      const sessionIds = new Map(data.sessions.map((session) => [session.id, randomUUID()]));
      const [profile] = data.profile;
      const days = data.programme[0]?.days ?? [];

      await db.transaction(async (tx) => {
        await tx.delete(schema.sessions).where(eq(schema.sessions.userId, userId));
        await tx.delete(schema.templates).where(eq(schema.templates.userId, userId));
        await tx.delete(schema.programmeDays).where(eq(schema.programmeDays.userId, userId));
        await tx.delete(schema.progress).where(eq(schema.progress.userId, userId));
        await tx.delete(schema.levelTests).where(eq(schema.levelTests.userId, userId));

        if (profile?.firstName)
          await tx.update(schema.user).set({ name: profile.firstName }).where(eq(schema.user.id, userId));
        const profileValues = {
          goalProgressionId: profile?.goalProgressionId ?? null,
          onboardedAt: profile?.onboardedAt ? new Date(profile.onboardedAt) : null,
        };
        await tx
          .insert(schema.profiles)
          .values({ userId, ...profileValues })
          .onConflictDoUpdate({ target: schema.profiles.userId, set: profileValues });

        if (data.templates.length > 0)
          await tx.insert(schema.templates).values(
            data.templates.map((template) => ({
              id: templateIds.get(template.id),
              userId,
              name: template.name,
              items: template.items,
              createdAt: new Date(template.createdAt),
              updatedAt: new Date(template.updatedAt),
            })),
          );
        await tx.insert(schema.programmeDays).values(
          Array.from({ length: 7 }, (_, dayIndex) => ({
            userId,
            dayIndex,
            templateId: templateIds.get(days[dayIndex]?.templateId ?? '') ?? null,
          })),
        );
        if (data.sessions.length > 0)
          await tx.insert(schema.sessions).values(
            data.sessions.map((session) => ({
              id: sessionIds.get(session.id),
              userId,
              templateId: templateIds.get(session.templateId ?? '') ?? null,
              title: session.title,
              startedAt: new Date(session.startedAt),
              endedAt: session.endedAt ? new Date(session.endedAt) : null,
              rpe: session.rpe ?? null,
              feeling: session.feeling ?? null,
              notes: session.notes ?? null,
              exercises: session.exercises,
            })),
          );
        if (data.progress.length > 0)
          await tx.insert(schema.progress).values(
            data.progress.map((entry) => ({
              userId,
              progressionId: entry.progressionId,
              currentStep: entry.currentStep,
              history: entry.history.map(({ sessionId, ...rest }) => ({
                ...rest,
                sessionId: sessionId ? sessionIds.get(sessionId) : undefined,
              })),
            })),
          );
        if (data.levelTests.length > 0)
          await tx
            .insert(schema.levelTests)
            .values(
              data.levelTests.map((test) => ({ userId, takenAt: new Date(test.takenAt), results: test.results })),
            );
      });
      return c.body(null, 204);
    },
    (result, c) => {
      if (!result.success) return c.json({ message: INVALID_BACKUP }, 400);
    },
  );

  return router;
};
