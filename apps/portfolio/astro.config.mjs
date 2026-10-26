// @ts-check
import { devHttps } from '@bpagoaga/dev-certs';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://bernardpagoaga.net',
  vite: {
    plugins: [tailwindcss(), devHttps()],
  },
});
