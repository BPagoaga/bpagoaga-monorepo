import { serve } from '@hono/node-server';
import { createTestApp } from '../src/testApp';

// `pnpm dev:memory`: the API on an in-memory Postgres (PGlite), without Docker. Everything is lost when it stops.
// BETTER_AUTH_URL is the web app's origin (default: its dev server), PORT the API's port.
const { app } = await createTestApp({
  origin: process.env.BETTER_AUTH_URL ?? 'https://localhost:5173',
  logRequests: true,
});
const port = Number(process.env.PORT ?? 3000);
serve({ fetch: app.fetch, port }, () => {
  console.log(`CaliBuddy API (in-memory Postgres) on http://localhost:${port} (docs: /api/docs)`);
});
