import { defineConfig } from 'vite-plus';

// Root Vite+ config: shared formatter (oxfmt) settings for the whole monorepo.
// Task orchestration is Turborepo's job (turbo.json), not `vp run`.
export default defineConfig({
  fmt: {
    singleQuote: true,
    printWidth: 120,
    ignorePatterns: [
      '**/dist/**',
      '**/.astro/**',
      '**/storybook-static/**',
      'pnpm-lock.yaml',
      'apps/mockups/assets/tailwind.css',
      // Generated from packages/ui/src/theme.css, compared as-is by its `--check` mode.
      'packages/ui-native/src/tokens.ts',
      // Generated: the API's OpenAPI document, the client Orval writes from it, Drizzle's migration snapshots.
      'apps/calisthenics-api/openapi.json',
      'apps/calisthenics-api/drizzle/meta/**',
      'packages/calisthenics-api-client/src/generated/**',
      // Nunjucks templates: Oxfmt formats them as plain HTML and breaks `{% … %}` / `{{ … }}` tags.
      'apps/mockups/**/*.html',
      'apps/mockups/**/*.njk',
    ],
  },
});
