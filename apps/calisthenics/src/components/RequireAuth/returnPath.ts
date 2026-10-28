/**
 * The page to go back to after signing in (`?retour=`). Only same-site paths: `//host` or `/\host` would leave the
 * site.
 */
export const safeReturnPath = (value: string | null) =>
  value?.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\') ? value : '/';
