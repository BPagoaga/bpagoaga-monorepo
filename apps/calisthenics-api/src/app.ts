import { OpenAPIHono } from '@hono/zod-openapi';
import { Scalar } from '@scalar/hono-api-reference';
import { sql } from 'drizzle-orm';
import { bodyLimit } from 'hono/body-limit';
import { except } from 'hono/combine';
import { cors } from 'hono/cors';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { logger } from 'hono/logger';
import type { Auth } from './auth';
import { backupRoutes } from './routes/backup';
import { profileRoutes } from './routes/profile';
import { programmeRoutes } from './routes/programme';
import { progressRoutes } from './routes/progress';
import { sessionRoutes } from './routes/sessions';
import { templateRoutes } from './routes/templates';
import type { IAppDeps, IAppEnv } from './types';

export const OPENAPI_PATH = '/api/openapi.json';

/** The OpenAPI document's header, shared by the served document and `pnpm openapi`. */
export const OPENAPI_CONFIG = {
  openapi: '3.1.0',
  info: {
    title: 'CaliBuddy API',
    version: '1.0.0',
    description:
      'Calisthenics training log. Sign in through Better Auth (`/api/auth/*`): every route below needs its session cookie.',
  },
  security: [{ sessionCookie: [] }],
};

const PUBLIC_PATHS = ['/api/auth/*', '/api/docs', OPENAPI_PATH, '/api/health'];

/** Answers 401 without a valid session cookie, otherwise exposes the user to the handlers. */
const requireUser = (auth: Auth) =>
  createMiddleware<IAppEnv>(async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) throw new HTTPException(401, { message: 'Connecte-toi pour continuer.' });
    c.set('userId', session.user.id);
    c.set('userName', session.user.name);
    await next();
  });

export const createApp = (deps: IAppDeps) => {
  const app = new OpenAPIHono<IAppEnv>();

  if (deps.logRequests) app.use(logger());

  // Only needed when the web app is served from another origin (in development, Vite proxies /api).
  if (deps.trustedOrigins.length > 0)
    app.use('/api/*', cors({ origin: deps.trustedOrigins, credentials: true, allowHeaders: ['Content-Type'] }));
  app.use('/api/*', bodyLimit({ maxSize: 5 * 1024 * 1024 }));

  app.on(['GET', 'POST'], '/api/auth/*', (c) => deps.auth.handler(c.req.raw));
  app.get('/api/health', async (c) => {
    await deps.db.execute(sql`select 1`);
    return c.json({ ok: true });
  });

  app.use('/api/*', except(PUBLIC_PATHS, requireUser(deps.auth)));
  for (const routes of [profileRoutes, templateRoutes, programmeRoutes, sessionRoutes, progressRoutes, backupRoutes])
    app.route('/api', routes(deps));

  app.openAPIRegistry.registerComponent('securitySchemes', 'sessionCookie', {
    type: 'apiKey',
    in: 'cookie',
    name: 'better-auth.session_token',
    description: 'Set by `POST /api/auth/sign-in/email` (`__Secure-` prefixed over HTTPS).',
  });
  app.doc31(OPENAPI_PATH, OPENAPI_CONFIG);
  app.get('/api/docs', Scalar({ url: OPENAPI_PATH, pageTitle: 'CaliBuddy API' }));

  app.notFound((c) => c.json({ message: 'Route introuvable.' }, 404));
  app.onError((error, c) => {
    if (error instanceof HTTPException) return c.json({ message: error.message }, error.status);
    console.error(error);
    return c.json({ message: 'Erreur du serveur, réessaie dans un instant.' }, 500);
  });

  return app;
};
