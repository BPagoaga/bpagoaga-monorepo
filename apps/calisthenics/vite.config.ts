import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, lazyPlugins } from 'vite-plus';

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
  plugins: lazyPlugins(() => [react(), tailwindcss()]),
});
