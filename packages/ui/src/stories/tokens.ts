import theme from '../theme.css?raw';
import type { IColorScale, IToken } from './types';

export * from './types';

/**
 * Tokens read from `theme.css` itself, so the stories can never drift from the source:
 * a token added there shows up here without touching a story.
 */
const declarations = [...theme.matchAll(/^\s*--([\w-]+):\s*([^;]+);/gm)].map(([, property, value]) => ({
  property,
  value: value.trim(),
}));

/** Tokens of one namespace (`color`, `text`…), without sub-properties such as `--text-title-l--line-height`. */
export const tokensOf = (namespace: string): IToken[] =>
  declarations
    .filter(({ property }) => property.startsWith(`${namespace}-`) && !property.includes('--'))
    .map(({ property, value }) => ({
      name: property.slice(namespace.length + 1),
      variable: `--${property}`,
      value,
    }));

const SHADE = /^(.+)-(\d+)$/;

/** Colour scales (`primary-10` … `primary-150`), in declaration order. */
export const colorScales = (): IColorScale[] => {
  const scales = new Map<string, IToken[]>();
  for (const token of tokensOf('color')) {
    const scale = SHADE.exec(token.name)?.[1];
    if (scale) {
      scales.set(scale, [...(scales.get(scale) ?? []), token]);
    }
  }
  return [...scales].map(([name, shades]) => ({ name, shades }));
};

/** Single colours: `white`, `black` and the semantic aliases (`surface`, `muted`…). */
export const singleColors = (): IToken[] => tokensOf('color').filter((token) => !SHADE.test(token.name));
