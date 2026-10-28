/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** The API's origin when it is not the page's (see src/config.ts). */
  readonly VITE_API_URL?: string;
}
