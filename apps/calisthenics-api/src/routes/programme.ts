import { createRoute } from '@hono/zod-openapi';
import { asc, eq } from 'drizzle-orm';
import type { Database } from '../db';
import { schema } from '../db';
import { toProgramme } from '../mappers';
import { createRouter, errorResponses, jsonBody, jsonContent, notFoundResponse } from '../router';
import { DayParamsSchema, ProgrammeDayInputSchema, ProgrammeSchema } from '../schemas';
import type { IAppDeps } from '../types';
import { findTemplate } from './templates';

const tags = ['Programme'];

const fetchProgramme = createRoute({
  operationId: 'fetchProgramme',
  tags,
  method: 'get',
  path: '/programme',
  responses: { 200: jsonContent(ProgrammeSchema, 'The week, Monday first'), ...errorResponses },
});

const setProgrammeDay = createRoute({
  operationId: 'setProgrammeDay',
  tags,
  method: 'put',
  path: '/programme/days/{dayIndex}',
  request: { params: DayParamsSchema, ...jsonBody(ProgrammeDayInputSchema) },
  responses: { 200: jsonContent(ProgrammeSchema, 'The updated week'), ...errorResponses, ...notFoundResponse },
});

const readProgramme = async (db: Database, userId: string) =>
  toProgramme(
    await db
      .select()
      .from(schema.programmeDays)
      .where(eq(schema.programmeDays.userId, userId))
      .orderBy(asc(schema.programmeDays.dayIndex)),
  );

export const programmeRoutes = ({ db }: IAppDeps) => {
  const router = createRouter();

  router.openapi(fetchProgramme, async (c) => c.json(await readProgramme(db, c.var.userId), 200));

  router.openapi(setProgrammeDay, async (c) => {
    const userId = c.var.userId;
    const { dayIndex } = c.req.valid('param');
    const { templateId } = c.req.valid('json');
    if (templateId) await findTemplate(db, userId, templateId);
    await db
      .insert(schema.programmeDays)
      .values({ userId, dayIndex, templateId })
      .onConflictDoUpdate({
        target: [schema.programmeDays.userId, schema.programmeDays.dayIndex],
        set: { templateId },
      });
    return c.json(await readProgramme(db, userId), 200);
  });

  return router;
};
