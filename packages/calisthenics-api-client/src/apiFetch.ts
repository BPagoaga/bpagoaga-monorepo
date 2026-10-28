// Custom fetch for the generated client (Orval `mutator`): base URL, session cookie, and errors as `ApiError`.

let baseUrl = '';

/** Where the API lives. Defaults to the page's own origin (`/api/...`), which the web app proxies in development. */
export const setApiBaseUrl = (url: string) => {
  baseUrl = url.replace(/\/$/, '');
};

/** Any failed call. `message` is the API's user-facing (French) message, ready to display. */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const parse = (text: string): unknown => {
  try {
    return text ? JSON.parse(text) : undefined;
  } catch {
    return undefined;
  }
};

const messageOf = (body: unknown) =>
  typeof body === 'object' && body !== null && 'message' in body && typeof body.message === 'string'
    ? body.message
    : undefined;

export const apiFetch = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  let response: Response;
  try {
    // `include`: the session cookie also goes along when the API is on another origin.
    response = await fetch(`${baseUrl}${url}`, { ...options, credentials: 'include' });
  } catch {
    throw new ApiError(0, 'Impossible de joindre le serveur. Vérifie ta connexion et réessaie.');
  }
  const body = parse(await response.text());
  if (!response.ok)
    throw new ApiError(response.status, messageOf(body) ?? 'Une erreur est survenue. Réessaie dans un instant.');
  return body as T;
};

export type ErrorType<Error> = Error extends ApiError ? Error : ApiError;
export type BodyType<Body> = Body;
