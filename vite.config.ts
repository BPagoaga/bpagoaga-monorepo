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
      // Nunjucks templates: Oxfmt formats them as plain HTML and breaks `{% … %}` / `{{ … }}` tags.
      'apps/mockups/**/*.html',
      'apps/mockups/**/*.njk',
    ],
  },
});
