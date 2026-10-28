import type { ISessionExercise } from '@bpagoaga/calisthenics-core/domain/types';
import { createRoute, z } from '@hono/zod-openapi';
import { and, desc, eq, isNull } from 'drizzle-orm';
import type { Database } from '../db';
import { schema } from '../db';
import { conflict, isUniqueViolation, notFound } from '../errors';
import { toSession } from '../mappers';
import {
  conflictResponse,
  createRouter,
  errorResponses,
  jsonBody,
  jsonContent,
  noContent,
  notFoundResponse,
} from '../router';
import {
  SessionExerciseInputSchema,
  SessionExerciseParamsSchema,
  SessionFinishSchema,
  SessionParamsSchema,
  SessionSchema,
  SessionStartSchema,
  SetInputSchema,
} from '../schemas';
import type { IAppDeps } from '../types';
import { findTemplate } from './templates';

const tags = ['Sessions'];
const sessionResponses = {
  200: jsonContent(SessionSchema, 'The updated session'),
  ...errorResponses,
  ...notFoundResponse,
} as const;

const ALREADY_RUNNING = 'Une séance est déjà en cours : termine-la avant d’en commencer une autre.';

const fetchSessions = createRoute({
  operationId: 'fetchSessions',
  tags,
  method: 'get',
  path: '/sessions',
  responses: { 200: jsonContent(z.array(SessionSchema), 'Sessions, newest first'), ...errorResponses },
});

const fetchCurrentSession = createRoute({
  operationId: 'fetchCurrentSession',
  tags,
  method: 'get',
  path: '/sessions/current',
  responses: {
    200: jsonContent(z.union([SessionSchema, z.null()]), 'The session in progress, or null'),
    ...errorResponses,
  },
});

const startSession = createRoute({
  operationId: 'startSession',
  tags,
  method: 'post',
  path: '/sessions',
  request: jsonBody(SessionStartSchema),
  responses: {
    201: jsonContent(SessionSchema, 'The started session'),
    ...errorResponses,
    ...notFoundResponse,
    ...conflictResponse,
  },
});

const fetchSession = createRoute({
  operationId: 'fetchSession',
  tags,
  method: 'get',
  path: '/sessions/{sessionId}',
  request: { params: SessionParamsSchema },
  responses: { 200: jsonContent(SessionSchema, 'The session'), ...errorResponses, ...notFoundResponse },
});

const logSet = createRoute({
  operationId: 'logSet',
  tags,
  method: 'post',
  path: '/sessions/{sessionId}/exercises/{exerciseIndex}/sets',
  request: { params: SessionExerciseParamsSchema, ...jsonBody(SetInputSchema) },
  responses: sessionResponses,
});

const removeLastSet = createRoute({
  operationId: 'removeLastSet',
  tags,
  method: 'delete',
  path: '/sessions/{sessionId}/exercises/{exerciseIndex}/sets/last',
  request: { params: SessionExerciseParamsSchema },
  responses: sessionResponses,
});

const addSessionExercise = createRoute({
  operationId: 'addSessionExercise',
  tags,
  method: 'post',
  path: '/sessions/{sessionId}/exercises',
  request: { params: SessionParamsSchema, ...jsonBody(SessionExerciseInputSchema) },
  responses: sessionResponses,
});

const finishSession = createRoute({
  operationId: 'finishSession',
  tags,
  method: 'post',
  path: '/sessions/{sessionId}/finish',
  request: { params: SessionParamsSchema, ...jsonBody(SessionFinishSchema) },
  responses: {
    200: jsonContent(SessionSchema, 'The finished session'),
    ...errorResponses,
    ...notFoundResponse,
    ...conflictResponse,
  },
});

const deleteSession = createRoute({
  operationId: 'deleteSession',
  tags,
  method: 'delete',
  path: '/sessions/{sessionId}',
  request: { params: SessionParamsSchema },
  responses: { ...noContent, ...errorResponses, ...notFoundResponse },
});

const ownSession = (userId: string, sessionId: string) =>
  and(eq(schema.sessions.userId, userId), eq(schema.sessions.id, sessionId));

type SessionRow = typeof schema.sessions.$inferSelect;

/** Reads, changes and writes a session in one transaction, the row locked so two quick taps can't lose a set. */
const updateSession = (
  db: Database,
  userId: string,
  sessionId: string,
  change: (session: SessionRow) => Partial<SessionRow>,
) =>
  db.transaction(async (tx) => {
    const [session] = await tx.select().from(schema.sessions).where(ownSession(userId, sessionId)).for('update');
    if (!session) throw notFound('Séance introuvable.');
    const [row] = await tx
      .update(schema.sessions)
      .set(change(session))
      .where(eq(schema.sessions.id, session.id))
      .returning();
    return toSession(row!);
  });

const updateExercise = (
  db: Database,
  userId: string,
  { sessionId, exerciseIndex }: { sessionId: string; exerciseIndex: number },
  change: (exercise: ISessionExercise) => ISessionExercise,
) =>
  updateSession(db, userId, sessionId, (session) => {
    if (!session.exercises[exerciseIndex]) throw notFound('Exercice introuvable dans cette séance.');
    return {
      exercises: session.exercises.map((exercise, index) => (index === exerciseIndex ? change(exercise) : exercise)),
    };
  });

export const sessionRoutes = ({ db }: IAppDeps) => {
  const router = createRouter();

  router.openapi(fetchSessions, async (c) => {
    const rows = await db
      .select()
      .from(schema.sessions)
      .where(eq(schema.sessions.userId, c.var.userId))
      .orderBy(desc(schema.sessions.startedAt));
    return c.json(rows.map(toSession), 200);
  });

  router.openapi(fetchCurrentSession, async (c) => {
    const [row] = await db
      .select()
      .from(schema.sessions)
      .where(and(eq(schema.sessions.userId, c.var.userId), isNull(schema.sessions.endedAt)));
    return c.json(row ? toSession(row) : null, 200);
  });

  router.openapi(startSession, async (c) => {
    const { title, templateId, exercises } = c.req.valid('json');
    if (templateId) await findTemplate(db, c.var.userId, templateId);
    try {
      const [row] = await db
        .insert(schema.sessions)
        .values({
          userId: c.var.userId,
          title,
          templateId,
          exercises: exercises.map((exercise) => ({ ...exercise, sets: [] })),
        })
        .returning();
      return c.json(toSession(row!), 201);
    } catch (error) {
      // `sessions_one_running_idx`: one session in progress at a time.
      if (isUniqueViolation(error)) throw conflict(ALREADY_RUNNING);
      throw error;
    }
  });

  router.openapi(fetchSession, async (c) => {
    const [row] = await db
      .select()
      .from(schema.sessions)
      .where(ownSession(c.var.userId, c.req.valid('param').sessionId));
    if (!row) throw notFound('Séance introuvable.');
    return c.json(toSession(row), 200);
  });

  router.openapi(logSet, async (c) => {
    const set = { ...c.req.valid('json'), doneAt: new Date().toISOString() };
    return c.json(
      await updateExercise(db, c.var.userId, c.req.valid('param'), (exercise) => ({
        ...exercise,
        sets: [...exercise.sets, set],
      })),
      200,
    );
  });

  router.openapi(removeLastSet, async (c) =>
    c.json(
      await updateExercise(db, c.var.userId, c.req.valid('param'), (exercise) => ({
        ...exercise,
        sets: exercise.sets.slice(0, -1),
      })),
      200,
    ),
  );

  router.openapi(addSessionExercise, async (c) => {
    const { exerciseId } = c.req.valid('json');
    return c.json(
      await updateSession(db, c.var.userId, c.req.valid('param').sessionId, (session) => ({
        exercises: [...session.exercises, { exerciseId, sets: [] }],
      })),
      200,
    );
  });

  router.openapi(finishSession, async (c) => {
    const { rpe, feeling, notes } = c.req.valid('json');
    return c.json(
      await updateSession(db, c.var.userId, c.req.valid('param').sessionId, (session) => {
        if (session.endedAt) throw conflict('Cette séance est déjà terminée.');
        return { rpe, feeling, notes, endedAt: new Date() };
      }),
      200,
    );
  });

  router.openapi(deleteSession, async (c) => {
    const deleted = await db
      .delete(schema.sessions)
      .where(ownSession(c.var.userId, c.req.valid('param').sessionId))
      .returning({ id: schema.sessions.id });
    if (deleted.length === 0) throw notFound('Séance introuvable.');
    return c.body(null, 204);
  });

  return router;
};
