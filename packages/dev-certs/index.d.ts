import type { Plugin } from 'vite';

export interface IDevCertPaths {
  cert: string;
  key: string;
}

export interface IDevCerts {
  cert: Buffer;
  key: Buffer;
}

export declare const CERT_PATH: string;
export declare const KEY_PATH: string;

/** Creates the certificate if needed (or always with `force`) and returns its file paths. */
export declare const ensureDevCerts: (options?: { force?: boolean }) => IDevCertPaths;

/** Certificate contents, as expected by Node's `https` options (Vite `server.https`). */
export declare const readDevCerts: () => IDevCerts;

/** Vite plugin serving the dev server (and `vite preview`) over HTTPS. */
export declare const devHttps: () => Plugin;
