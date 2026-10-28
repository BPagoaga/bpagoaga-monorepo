import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import * as schema from './schema';

export { schema };

/** Any Postgres driver: postgres.js in the server, PGlite in the tests. */
export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;
export type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];
