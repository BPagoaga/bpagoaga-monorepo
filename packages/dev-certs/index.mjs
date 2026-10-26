import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * One localhost certificate shared by every dev server of the monorepo, stored in the
 * git-ignored `.certs/` folder at the repo root and created on first use.
 *
 * With mkcert installed (`brew install mkcert && mkcert -install`) the certificate is
 * signed by a locally trusted CA: no browser warning. Otherwise it falls back to a
 * self-signed certificate (openssl), which the browser asks to accept once.
 */
const CERTS_DIR = fileURLToPath(new URL('../../.certs/', import.meta.url));
const HOSTS = ['localhost', '127.0.0.1', '::1'];

export const CERT_PATH = `${CERTS_DIR}localhost.pem`;
export const KEY_PATH = `${CERTS_DIR}localhost-key.pem`;

const hasCommand = (command) => {
  try {
    execFileSync('which', [command], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

const createWithMkcert = () => {
  execFileSync('mkcert', ['-cert-file', CERT_PATH, '-key-file', KEY_PATH, ...HOSTS], { stdio: 'ignore' });
};

const createSelfSigned = () => {
  const altNames = HOSTS.map((host) => (host.includes('.') || host.includes(':') ? `IP:${host}` : `DNS:${host}`));
  execFileSync(
    'openssl',
    [
      'req',
      '-x509',
      '-newkey',
      'rsa:2048',
      '-nodes',
      '-sha256',
      '-days',
      '825',
      '-subj',
      '/CN=localhost',
      '-addext',
      `subjectAltName=${altNames.join(',')}`,
      '-keyout',
      KEY_PATH,
      '-out',
      CERT_PATH,
    ],
    { stdio: 'ignore' },
  );
  console.warn(
    '[dev-certs] Self-signed certificate created: the browser will ask to accept it once.\n' +
      '[dev-certs] For a trusted one: `brew install mkcert && mkcert -install`, then `pnpm certs --force`.',
  );
};

/** Creates the certificate if needed (or always with `force`) and returns its file paths. */
export const ensureDevCerts = ({ force = false } = {}) => {
  if (force || !existsSync(CERT_PATH) || !existsSync(KEY_PATH)) {
    mkdirSync(CERTS_DIR, { recursive: true });
    if (hasCommand('mkcert')) {
      createWithMkcert();
    } else {
      createSelfSigned();
    }
  }
  return { cert: CERT_PATH, key: KEY_PATH };
};

/** Certificate contents, as expected by Node's `https` options (Vite `server.https`). */
export const readDevCerts = () => {
  const { cert, key } = ensureDevCerts();
  return { cert: readFileSync(cert), key: readFileSync(key) };
};

/**
 * Vite plugin serving the dev server (and `vite preview`) over HTTPS. Works in any
 * Vite-based app, Astro included (`vite.plugins`). Skipped in middleware mode, where
 * there is no server of its own to secure (e.g. Astro's internal build-time server).
 */
export const devHttps = () => ({
  name: 'bpagoaga:dev-https',
  apply: 'serve',
  config: (config) => (config.server?.middlewareMode ? undefined : { server: { https: readDevCerts() } }),
});
