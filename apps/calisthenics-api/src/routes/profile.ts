import { createRoute } from '@hono/zod-openapi';
import { eq } from 'drizzle-orm';
import type { Database } from '../db';
import { schema } from '../db';
import { createRouter, errorResponses, jsonBody, jsonContent } from '../router';
import { ProfileSchema, ProfileUpdateSchema } from '../schemas';
import type { IAppDeps } from '../types';

const tags = ['Profile'];

const fetchProfile = createRoute({
  operationId: 'fetchProfile',
  tags,
  method: 'get',
  path: '/profile',
  responses: { 200: jsonContent(ProfileSchema, 'The signed-in user’s profile'), ...errorResponses },
});

const updateProfile = createRoute({
  operationId: 'updateProfile',
  tags,
  method: 'patch',
  path: '/profile',
  request: jsonBody(ProfileUpdateSchema),
  responses: { 200: jsonContent(ProfileSchema, 'The updated profile'), ...errorResponses },
});

const readProfile = async (db: Database, userId: string) => {
  const [row] = await db
    .select({
      firstName: schema.user.name,
      goalProgressionId: schema.profiles.goalProgressionId,
      onboardedAt: schema.profiles.onboardedAt,
    })
    .from(schema.user)
    .leftJoin(schema.profiles, eq(schema.profiles.userId, schema.user.id))
    .where(eq(schema.user.id, userId));
  return {
    firstName: row?.firstName || undefined,
    goalProgressionId: row?.goalProgressionId ?? undefined,
    onboardedAt: row?.onboardedAt?.toISOString(),
  };
};

export const profileRoutes = ({ db }: IAppDeps) => {
  const router = createRouter();

  router.openapi(fetchProfile, async (c) => c.json(await readProfile(db, c.var.userId), 200));

  router.openapi(updateProfile, async (c) => {
    const { firstName, goalProgressionId, onboardedAt } = c.req.valid('json');
    const userId = c.var.userId;
    await db.transaction(async (tx) => {
      if (firstName !== undefined)
        await tx.update(schema.user).set({ name: firstName }).where(eq(schema.user.id, userId));
      const changes = {
        ...(goalProgressionId !== undefined && { goalProgressionId }),
        ...(onboardedAt !== undefined && { onboardedAt: new Date(onboardedAt) }),
      };
      // `userId` keeps `set` non-empty when only the first name changes.
      await tx
        .insert(schema.profiles)
        .values({ userId, ...changes })
        .onConflictDoUpdate({ target: schema.profiles.userId, set: { userId, ...changes } });
    });
    return c.json(await readProfile(db, userId), 200);
  });

  return router;
};
