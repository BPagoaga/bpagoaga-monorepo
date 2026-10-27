import type { colors, radii, shadows, typography } from './tokens';

export type ColorToken = keyof typeof colors;
export type TypographyToken = keyof typeof typography;
export type RadiusToken = keyof typeof radii;
export type ShadowToken = keyof typeof shadows;

export type FontFamilyToken = 'sans' | 'display' | 'mono';
export type FontWeight = 400 | 500 | 600 | 700;
