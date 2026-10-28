import { writeFileSync } from 'node:fs';
import { drizzle } from 'drizzle-orm/postgres-js';
import { createApp, OPENAPI_PATH } from '../src/app';
import { createAuth } from '../src/auth';
import { schema } from '../src/db';

// Writes openapi.json, the contract the client package (@bpagoaga/calisthenics-api-client) is generated from.
// No database needed: the document only describes the routes.
const db = drizzle.mock({ schema });
const auth = createAuth(db, {
  BETTER_AUTH_SECRET: 'openapi-generation-only-not-a-real-secret',
  BETTER_AUTH_URL: 'http://localhost:3000',
  TRUSTED_ORIGINS: [],
});
const response = await createApp({ db, auth, trustedOrigins: [] }).request(OPENAPI_PATH);
writeFileSync(new URL('../openapi.json', import.meta.url), `${JSON.stringify(await response.json(), null, 2)}\n`);
console.log('openapi.json written');
