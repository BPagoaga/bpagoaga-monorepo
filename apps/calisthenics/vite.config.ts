import { devHttps } from '@bpagoaga/dev-certs';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, lazyPlugins } from 'vite-plus';

const API_PROXY = { target: process.env.API_PROXY_TARGET ?? 'http://localhost:3000' };

// https://viteplus.dev/config/
export default defineConfig({
  lint: {
    plugins: ['react', 'typescript', 'oxc'],
    rules: {
      'react/rules-of-hooks': 'error',
      'react/exhaustive-deps': 'warn',
      'react/only-export-components': ['warn', { allowConstantExport: true }],
      eqeqeq: 'error',
      'vite-plus/prefer-vite-plus-imports': 'error',
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
    jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
  },
  plugins: lazyPlugins(() => [react(), tailwindcss(), devHttps()]),
  // The API (apps/calisthenics-api, `pnpm dev:api`) behind the same origin: cookies stay first-party, no CORS.
  server: { proxy: { '/api': API_PROXY } },
  preview: { proxy: { '/api': API_PROXY } },
});
