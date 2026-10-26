import { parse } from 'yaml';

/**
 * Mockups server.
 *
 * Two responsibilities: resolve component macros so no page ever duplicates markup, and
 * expose the design tokens (via the compiled `assets/tailwind.css`, built from
 * `@bpagoaga/ui`) so a mockup can't hardcode a raw value even by accident.
 */
export default function (eleventyConfig) {
  // `.meta.yml` files feed the catalogue: read as data, never published as-is.
  eleventyConfig.addDataExtension('yml', (contents) => parse(contents));

  eleventyConfig.addPassthroughCopy('assets');
  // Rebased by Tailwind relative to the compiled assets/tailwind.css (../webfonts/…), so
  // the destination must be the dist root's `webfonts/`, not nested under assets/.
  eleventyConfig.addPassthroughCopy({
    'node_modules/@fortawesome/fontawesome-free/webfonts': 'webfonts',
  });
  eleventyConfig.addPassthroughCopy('components/**/*.{css,js,svg,png,jpg,jpeg,webp,avif}');
  eleventyConfig.addPassthroughCopy('pages/**/*.{css,js,svg,png,jpg,jpeg,webp,avif}');

  eleventyConfig.setServerOptions({ showAllHosts: false });

  return {
    dir: {
      input: '.',
      includes: '_includes',
      data: '_data',
      output: 'dist',
    },
    // Nunjucks everywhere — component includes are macros, which Eleventy's default
    // Liquid engine can't express with the same explicit, scoped parameter passing.
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
  };
}
