import { createAuthClient } from 'better-auth/client';
import { API_URL } from '../../config';

/** Better Auth's client: sign-up, sign-in and session on the API's `/api/auth/*` routes. */
export const authClient = createAuthClient({ baseURL: `${API_URL || window.location.origin}/api/auth` });
