import { createRoute, z } from '@hono/zod-openapi';
import { and, asc, eq } from 'drizzle-orm';
import type { Database } from '../db';
import { schema } from '../db';
import { notFound } from '../errors';
import { toTemplate } from '../mappers';
import { createRouter, errorResponses, jsonBody, jsonContent, noContent, notFoundResponse } from '../router';
import { TemplateInputSchema, TemplateItemSchema, TemplateParamsSchema, TemplateSchema } from '../schemas';
import type { IAppDeps } from '../types';

const tags = ['Templates'];
const request = { params: TemplateParamsSchema };

const fetchTemplates = createRoute({
  operationId: 'fetchTemplates',
  tags,
  method: 'get',
  path: '/templates',
  responses: { 200: jsonContent(z.array(TemplateSchema), 'Templates, oldest first'), ...errorResponses },
});

const createTemplate = createRoute({
  operationId: 'createTemplate',
  tags,
  method: 'post',
  path: '/templates',
  request: jsonBody(TemplateInputSchema),
  responses: { 201: jsonContent(TemplateSchema, 'The new template'), ...errorResponses },
});

const fetchTemplate = createRoute({
  operationId: 'fetchTemplate',
  tags,
  method: 'get',
  path: '/templates/{templateId}',
  request,
  responses: { 200: jsonContent(TemplateSchema, 'The template'), ...errorResponses, ...notFoundResponse },
});

const updateTemplate = createRoute({
  operationId: 'updateTemplate',
  tags,
  method: 'put',
  path: '/templates/{templateId}',
  request: { ...request, ...jsonBody(TemplateInputSchema) },
  responses: { 200: jsonContent(TemplateSchema, 'The updated template'), ...errorResponses, ...notFoundResponse },
});

const deleteTemplate = createRoute({
  operationId: 'deleteTemplate',
  tags,
  description: 'Programme days using the template become rest days; logged sessions keep their copy.',
  method: 'delete',
  path: '/templates/{templateId}',
  request,
  responses: { ...noContent, ...errorResponses, ...notFoundResponse },
});

const duplicateTemplate = createRoute({
  operationId: 'duplicateTemplate',
  tags,
  method: 'post',
  path: '/templates/{templateId}/duplicate',
  request,
  responses: { 201: jsonContent(TemplateSchema, 'The copy'), ...errorResponses, ...notFoundResponse },
});

const addTemplateItem = createRoute({
  operationId: 'addTemplateItem',
  tags,
  method: 'post',
  path: '/templates/{templateId}/items',
  request: { ...request, ...jsonBody(TemplateItemSchema) },
  responses: { 200: jsonContent(TemplateSchema, 'The updated template'), ...errorResponses, ...notFoundResponse },
});

const ownTemplate = (userId: string, templateId: string) =>
  and(eq(schema.templates.userId, userId), eq(schema.templates.id, templateId));

export const findTemplate = async (db: Database, userId: string, templateId: string) => {
  const [row] = await db.select().from(schema.templates).where(ownTemplate(userId, templateId));
  if (!row) throw notFound('Modèle introuvable.');
  return row;
};

export const templateRoutes = ({ db }: IAppDeps) => {
  const router = createRouter();

  router.openapi(fetchTemplates, async (c) => {
    const rows = await db
      .select()
      .from(schema.templates)
      .where(eq(schema.templates.userId, c.var.userId))
      .orderBy(asc(schema.templates.createdAt));
    return c.json(rows.map(toTemplate), 200);
  });

  router.openapi(createTemplate, async (c) => {
    const [row] = await db
      .insert(schema.templates)
      .values({ userId: c.var.userId, ...c.req.valid('json') })
      .returning();
    return c.json(toTemplate(row!), 201);
  });

  router.openapi(fetchTemplate, async (c) =>
    c.json(toTemplate(await findTemplate(db, c.var.userId, c.req.valid('param').templateId)), 200),
  );

  router.openapi(updateTemplate, async (c) => {
    const { templateId } = c.req.valid('param');
    const [row] = await db
      .update(schema.templates)
      .set({ ...c.req.valid('json'), updatedAt: new Date() })
      .where(ownTemplate(c.var.userId, templateId))
      .returning();
    if (!row) throw notFound('Modèle introuvable.');
    return c.json(toTemplate(row), 200);
  });

  router.openapi(deleteTemplate, async (c) => {
    const { templateId } = c.req.valid('param');
    // `on delete set null` frees the programme days and the sessions' link.
    const deleted = await db
      .delete(schema.templates)
      .where(ownTemplate(c.var.userId, templateId))
      .returning({ id: schema.templates.id });
    if (deleted.length === 0) throw notFound('Modèle introuvable.');
    return c.body(null, 204);
  });

  router.openapi(duplicateTemplate, async (c) => {
    const template = await findTemplate(db, c.var.userId, c.req.valid('param').templateId);
    const [row] = await db
      .insert(schema.templates)
      .values({ userId: c.var.userId, name: `${template.name} (copie)`, items: template.items })
      .returning();
    return c.json(toTemplate(row!), 201);
  });

  router.openapi(addTemplateItem, async (c) => {
    const template = await findTemplate(db, c.var.userId, c.req.valid('param').templateId);
    const [row] = await db
      .update(schema.templates)
      .set({ items: [...template.items, c.req.valid('json')], updatedAt: new Date() })
      .where(ownTemplate(c.var.userId, template.id))
      .returning();
    return c.json(toTemplate(row!), 200);
  });

  return router;
};
