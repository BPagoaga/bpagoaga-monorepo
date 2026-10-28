import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { serve } from '@hono/node-server';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { createApp } from './app';
import { createAuth } from './auth';
import { schema } from './db';
import { readEnv } from './env';

// Local development reads `.env`; deployed environments set real variables.
if (existsSync('.env')) process.loadEnvFile('.env');
const env = readEnv();

const client = postgres(env.DATABASE_URL);
const db = drizzle({ client, schema });

// Migrations ship next to the code (`drizzle/`) and run at startup, before the first request.
await migrate(db, { migrationsFolder: fileURLToPath(new URL('../drizzle', import.meta.url)) });

const app = createApp({
  db,
  auth: createAuth(db, env),
  trustedOrigins: env.TRUSTED_ORIGINS,
  logRequests: env.NODE_ENV === 'development',
});

const server = serve({ fetch: app.fetch, port: env.PORT }, ({ port }) => {
  console.log(`CaliBuddy API on http://localhost:${port} (docs: /api/docs)`);
});

const shutdown = () => {
  server.close(() => void client.end());
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
