import type { Auth } from './auth';
import type { Database } from './db';

export interface IAppDeps {
  db: Database;
  auth: Auth;
  /** Origins allowed to call the API with cookies from another origin (CORS). */
  trustedOrigins: string[];
  /** One log line per request (development). */
  logRequests?: boolean;
}

/** Hono context of the API routes: the signed-in user, set by `requireUser`. */
export interface IAppEnv {
  Variables: {
    userId: string;
    userName: string;
  };
}
