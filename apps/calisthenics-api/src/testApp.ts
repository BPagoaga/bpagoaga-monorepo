import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { createApp } from './app';
import { createAuth } from './auth';
import { schema } from './db';

const ORIGIN = 'http://localhost:5173';

/**
 * The API on a fresh in-memory Postgres (PGlite), migrations applied: for the tests, and for `pnpm dev:memory`
 * (no Docker, data lost on exit).
 */
export const createTestApp = async ({ origin = ORIGIN, logRequests = false } = {}) => {
  const db = drizzle({ client: new PGlite(), schema });
  await migrate(db, { migrationsFolder: fileURLToPath(new URL('../drizzle', import.meta.url)) });
  const auth = createAuth(db, {
    BETTER_AUTH_SECRET: 'in-memory-only-secret-in-memory-only-0123',
    BETTER_AUTH_URL: origin,
    TRUSTED_ORIGINS: [],
  });
  const app = createApp({ db, auth, trustedOrigins: [], logRequests });

  /** Signs up a new account and returns a `fetch`-like client carrying its session cookie. */
  const signUp = async (email = 'bernard@example.com', name = 'Bernard') => {
    const response = await app.request('/api/auth/sign-up/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
      body: JSON.stringify({ email, name, password: 'correct horse battery' }),
    });
    if (!response.ok) throw new Error(`Sign-up failed: ${response.status} ${await response.text()}`);
    const cookie = response.headers
      .getSetCookie()
      .map((header) => header.split(';')[0])
      .join('; ');

    const call = async (method: string, path: string, body?: unknown) => {
      const res = await app.request(`/api${path}`, {
        method,
        headers: { Cookie: cookie, Origin: ORIGIN, ...(body !== undefined && { 'Content-Type': 'application/json' }) },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const text = await res.text();
      return { status: res.status, body: text ? JSON.parse(text) : undefined };
    };
    return {
      get: (path: string) => call('GET', path),
      post: (path: string, body: unknown = {}) => call('POST', path, body),
      put: (path: string, body: unknown) => call('PUT', path, body),
      patch: (path: string, body: unknown) => call('PATCH', path, body),
      delete: (path: string) => call('DELETE', path),
    };
  };

  return { app, db, signUp };
};
