import { OpenAPIHono, z } from '@hono/zod-openapi';
import { ErrorSchema } from './schemas';
import type { IAppEnv } from './types';

/** An OpenAPIHono router whose validation errors answer `400 { message }`, the API's only error shape. */
export const createRouter = () =>
  new OpenAPIHono<IAppEnv>({
    defaultHook: (result, c) => {
      if (!result.success) {
        const issue = result.error.issues[0];
        return c.json({ message: issue?.message ?? 'Requête invalide.' }, 400);
      }
    },
  });

export const jsonContent = <T extends z.ZodType>(schema: T, description: string) => ({
  content: { 'application/json': { schema } },
  description,
});

export const jsonBody = <T extends z.ZodType>(schema: T) => ({
  body: { content: { 'application/json': { schema } }, required: true },
});

/** Error responses every authenticated route can answer, for the OpenAPI document. */
export const errorResponses = {
  400: jsonContent(ErrorSchema, 'Invalid request'),
  401: jsonContent(ErrorSchema, 'Not signed in'),
} as const;

export const notFoundResponse = { 404: jsonContent(ErrorSchema, 'Not found') } as const;
export const conflictResponse = { 409: jsonContent(ErrorSchema, 'Conflicts with the current state') } as const;
export const noContent = { 204: { description: 'Done' } } as const;
