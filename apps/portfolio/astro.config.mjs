// @ts-check
import { devHttps } from '@bpagoaga/dev-certs';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, envField } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://bernardpagoaga.net',
  // Values per mode in .env.development / .env.production.
  env: {
    schema: {
      TRAINING_URL: envField.string({ context: 'client', access: 'public', url: true }),
    },
  },
  vite: {
    plugins: [tailwindcss(), devHttps()],
  },
});
