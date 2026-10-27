import { defineConfig } from 'vite-plus';

// Only read by `vp lint` (Oxlint): the package ships TypeScript sources bundled by each app's Metro.
export default defineConfig({
  lint: {
    plugins: ['react', 'typescript', 'oxc'],
    rules: {
      'react/rules-of-hooks': 'error',
      'react/exhaustive-deps': 'warn',
      eqeqeq: 'error',
    },
  },
});
