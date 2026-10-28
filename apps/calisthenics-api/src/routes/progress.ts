import { getProgression } from '@bpagoaga/calisthenics-core/content/progressions';
import { placements } from '@bpagoaga/calisthenics-core/domain/levelTest';
import type { IProgressHistoryEntry, LevelTestResults } from '@bpagoaga/calisthenics-core/domain/types';
import { createRoute, z } from '@hono/zod-openapi';
import { and, desc, eq } from 'drizzle-orm';
import type { Transaction } from '../db';
import { schema } from '../db';
import { HTTPException } from 'hono/http-exception';
import { toLevelTest, toProgress } from '../mappers';
import { createRouter, errorResponses, jsonBody, jsonContent } from '../router';
import {
  LevelTestInputSchema,
  LevelTestSchema,
  ProgressionParamsSchema,
  ProgressSchema,
  ProgressStepInputSchema,
} from '../schemas';
import type { IAppDeps } from '../types';

const fetchProgress = createRoute({
  operationId: 'fetchProgress',
  tags: ['Progress'],
  method: 'get',
  path: '/progress',
  responses: {
    200: jsonContent(z.array(ProgressSchema), 'Current step of every started progression'),
    ...errorResponses,
  },
});

const setProgressStep = createRoute({
  operationId: 'setProgressStep',
  tags: ['Progress'],
  method: 'put',
  path: '/progress/{progressionId}',
  request: { params: ProgressionParamsSchema, ...jsonBody(ProgressStepInputSchema) },
  responses: { 200: jsonContent(ProgressSchema, 'The progression’s new step'), ...errorResponses },
});

const fetchLevelTests = createRoute({
  operationId: 'fetchLevelTests',
  tags: ['Level tests'],
  method: 'get',
  path: '/level-tests',
  responses: { 200: jsonContent(z.array(LevelTestSchema), 'Level tests, newest first'), ...errorResponses },
});

const createLevelTest = createRoute({
  operationId: 'createLevelTest',
  tags: ['Level tests'],
  description: 'Saves the results and places every progression at its starting step.',
  method: 'post',
  path: '/level-tests',
  request: jsonBody(LevelTestInputSchema),
  responses: { 201: jsonContent(LevelTestSchema, 'The saved test'), ...errorResponses },
});

/** Moves a progression to `step` and appends it to its history. */
const moveToStep = async (tx: Transaction, userId: string, progressionId: string, entry: IProgressHistoryEntry) => {
  const [current] = await tx
    .select()
    .from(schema.progress)
    .where(and(eq(schema.progress.userId, userId), eq(schema.progress.progressionId, progressionId)))
    .for('update');
  const history = [...(current?.history ?? []), entry];
  const [row] = await tx
    .insert(schema.progress)
    .values({ userId, progressionId, currentStep: entry.step, history })
    .onConflictDoUpdate({
      target: [schema.progress.userId, schema.progress.progressionId],
      set: { currentStep: entry.step, history },
    })
    .returning();
  return toProgress(row!);
};

export const placeProgressions = async (tx: Transaction, userId: string, results: LevelTestResults, takenAt: Date) => {
  for (const [progressionId, step] of Object.entries(placements(results)))
    await moveToStep(tx, userId, progressionId, { step, reachedAt: takenAt.toISOString(), source: 'level-test' });
};

export const progressRoutes = ({ db }: IAppDeps) => {
  const router = createRouter();

  router.openapi(fetchProgress, async (c) => {
    const rows = await db.select().from(schema.progress).where(eq(schema.progress.userId, c.var.userId));
    return c.json(rows.map(toProgress), 200);
  });

  router.openapi(setProgressStep, async (c) => {
    const { progressionId } = c.req.valid('param');
    const { step, source, sessionId } = c.req.valid('json');
    // `steps.length` = the figure is mastered.
    if (step > (getProgression(progressionId)?.steps.length ?? 0))
      throw new HTTPException(400, { message: 'Cette étape n’existe pas dans la progression.' });
    const entry = { step, source, sessionId, reachedAt: new Date().toISOString() };
    return c.json(await db.transaction((tx) => moveToStep(tx, c.var.userId, progressionId, entry)), 200);
  });

  router.openapi(fetchLevelTests, async (c) => {
    const rows = await db
      .select()
      .from(schema.levelTests)
      .where(eq(schema.levelTests.userId, c.var.userId))
      .orderBy(desc(schema.levelTests.takenAt));
    return c.json(rows.map(toLevelTest), 200);
  });

  router.openapi(createLevelTest, async (c) => {
    const { results } = c.req.valid('json');
    const userId = c.var.userId;
    const row = await db.transaction(async (tx) => {
      const [test] = await tx.insert(schema.levelTests).values({ userId, results }).returning();
      await placeProgressions(tx, userId, results, test!.takenAt);
      return test!;
    });
    return c.json(toLevelTest(row), 201);
  });

  return router;
};
