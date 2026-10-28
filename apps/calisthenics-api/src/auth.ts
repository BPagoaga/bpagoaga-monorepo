import { DEFAULT_TEMPLATES } from '@bpagoaga/calisthenics-core/content/templates';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import type { Database } from './db';
import { schema } from './db';
import type { Env } from './env';

/** Gives a new account its profile, the default templates and an all-rest programme. */
export const seedAccount = async (db: Database, userId: string) => {
  await db.transaction(async (tx) => {
    await tx.insert(schema.profiles).values({ userId });
    // One millisecond apart: templates are listed by creation date.
    const start = Date.now();
    await tx.insert(schema.templates).values(
      DEFAULT_TEMPLATES.map((template, index) => ({
        userId,
        ...template,
        createdAt: new Date(start + index),
        updatedAt: new Date(start + index),
      })),
    );
    await tx
      .insert(schema.programmeDays)
      .values(Array.from({ length: 7 }, (_, dayIndex) => ({ userId, dayIndex, templateId: null })));
  });
};

export const createAuth = (
  db: Database,
  env: Pick<Env, 'BETTER_AUTH_SECRET' | 'BETTER_AUTH_URL' | 'TRUSTED_ORIGINS'>,
) =>
  betterAuth({
    appName: 'CaliBuddy',
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    basePath: '/api/auth',
    trustedOrigins: env.TRUSTED_ORIGINS,
    database: drizzleAdapter(db, { provider: 'pg', schema, transaction: true }),
    // No email provider yet: no verification email and no password reset (see TASKS.md).
    emailAndPassword: { enabled: true, autoSignIn: true },
    databaseHooks: {
      user: { create: { after: (user) => seedAccount(db, user.id) } },
    },
  });

export type Auth = ReturnType<typeof createAuth>;
