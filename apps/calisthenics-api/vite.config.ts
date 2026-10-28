import { defineConfig } from 'vite-plus';

export default defineConfig({
  lint: {
    plugins: ['typescript', 'oxc', 'node'],
    rules: {
      eqeqeq: 'error',
      'vite-plus/prefer-vite-plus-imports': 'error',
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
    jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
  },
  // `vp pack`: one Node bundle in dist/, the workspace packages (TypeScript sources) inlined, npm dependencies kept
  // external and installed next to it.
  pack: {
    entry: ['src/index.ts'],
    platform: 'node',
    deps: { alwaysBundle: [/^@bpagoaga\//] },
  },
  test: {
    // Each test file starts its own in-memory Postgres (PGlite) and runs the migrations: a few seconds each.
    testTimeout: 20_000,
  },
});
