/**
 * The API's origin. Empty (the default) = the page's own origin: `vp dev` and `vp preview` proxy `/api` to the API
 * (see vite.config.ts). Set `VITE_API_URL` when the API is served from another origin.
 */
export const API_URL: string = import.meta.env.VITE_API_URL ?? '';
