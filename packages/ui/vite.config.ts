import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, lazyPlugins } from 'vite-plus';

// Used by Storybook (picked up by @storybook/react-vite) and by `vp lint`.
export default defineConfig({
  lint: {
    plugins: ['react', 'typescript', 'oxc'],
    rules: {
      'react/rules-of-hooks': 'error',
      'react/exhaustive-deps': 'warn',
      eqeqeq: 'error',
      'vite-plus/prefer-vite-plus-imports': 'error',
    },
    jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
  },
  plugins: lazyPlugins(() => [react(), tailwindcss()]),
});
