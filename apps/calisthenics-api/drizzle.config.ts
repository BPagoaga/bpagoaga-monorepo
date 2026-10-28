import { defineConfig } from 'drizzle-kit';

// `pnpm db:generate` writes a migration in drizzle/ from the changes to src/db/schema.ts; the server applies pending
// migrations at startup.
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: { url: process.env.DATABASE_URL ?? 'postgres://calibuddy:calibuddy@localhost:5432/calibuddy' },
});
