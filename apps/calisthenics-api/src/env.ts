import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.url(),
  /** Signs session cookies: `openssl rand -base64 32`. */
  BETTER_AUTH_SECRET: z.string().min(32),
  /** Public origin the browser talks to (the web app, which proxies `/api` in development). */
  BETTER_AUTH_URL: z.url(),
  /** Extra origins allowed to call the API with cookies, comma-separated. */
  TRUSTED_ORIGINS: z
    .string()
    .default('')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
});

export type Env = z.infer<typeof envSchema>;

/** Reads and validates the environment once, at startup: a missing variable stops the server with a clear message. */
export const readEnv = (source: NodeJS.ProcessEnv = process.env): Env => {
  const result = envSchema.safeParse(source);
  if (!result.success) throw new Error(`Invalid environment:\n${z.prettifyError(result.error)}`);
  return result.data;
};
