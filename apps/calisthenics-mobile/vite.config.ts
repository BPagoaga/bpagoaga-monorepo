import { defineConfig } from 'vite-plus';

// Only read by `vp lint` (Oxlint): the app itself is bundled by Metro (Expo).
export default defineConfig({
  lint: {
    plugins: ['react', 'typescript', 'oxc'],
    rules: {
      'react/rules-of-hooks': 'error',
      'react/exhaustive-deps': 'warn',
      eqeqeq: 'error',
    },
    ignorePatterns: ['.expo/**', 'dist/**'],
  },
});
