import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono/400Regular';
import { JetBrainsMono_600SemiBold } from '@expo-google-fonts/jetbrains-mono/600SemiBold';
import { SpaceGrotesk_500Medium } from '@expo-google-fonts/space-grotesk/500Medium';
import { SpaceGrotesk_600SemiBold } from '@expo-google-fonts/space-grotesk/600SemiBold';
import { SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk/700Bold';
import { useFonts } from 'expo-font';
import type { FontFamilyToken, FontWeight } from './types';

/** The faces the web loads from Google Fonts, keyed by the family name React Native uses once loaded. */
const FONT_ASSETS = {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
  JetBrainsMono_400Regular,
  JetBrainsMono_600SemiBold,
};

type FontFace = keyof typeof FONT_ASSETS;

const FACES: Record<FontFamilyToken, Partial<Record<FontWeight, FontFace>>> = {
  sans: { 400: 'Inter_400Regular', 500: 'Inter_500Medium', 600: 'Inter_600SemiBold', 700: 'Inter_700Bold' },
  display: { 500: 'SpaceGrotesk_500Medium', 600: 'SpaceGrotesk_600SemiBold', 700: 'SpaceGrotesk_700Bold' },
  mono: { 400: 'JetBrainsMono_400Regular', 600: 'JetBrainsMono_600SemiBold' },
};

/**
 * Loaded face closest to `weight`. React Native can't synthesise the weights of a custom
 * font (Android falls back to the system font), so each weight is its own family.
 */
export const fontFace = (family: FontFamilyToken, weight: FontWeight): FontFace => {
  const faces = Object.entries(FACES[family]) as [string, FontFace][];
  const [, face] = faces.reduce((closest, candidate) =>
    Math.abs(Number(candidate[0]) - weight) < Math.abs(Number(closest[0]) - weight) ? candidate : closest,
  );
  return face;
};

/** Loads every face of the design system. Keep the splash screen up until it returns `[true]`. */
export const useUiFonts = () => useFonts(FONT_ASSETS);
