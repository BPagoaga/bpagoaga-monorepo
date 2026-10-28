import { HTTPException } from 'hono/http-exception';

// Errors thrown by the handlers; `app.onError` turns them into `{ message }` responses. Messages are user-facing (French).

export const notFound = (message: string) => new HTTPException(404, { message });
export const conflict = (message: string) => new HTTPException(409, { message });

/** Postgres unique violation, wrapped or not by Drizzle (`DrizzleQueryError.cause`). */
export const isUniqueViolation = (error: unknown): boolean => {
  if (typeof error !== 'object' || error === null) return false;
  if ('code' in error && error.code === '23505') return true;
  return 'cause' in error && isUniqueViolation(error.cause);
};
