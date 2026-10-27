import { Text as NativeText } from 'react-native';
import { fontFace } from '../../fonts';
import { colors, typography } from '../../tokens';
import type { FontWeight } from '../../types';
import type { ITextProps } from './types';

export * from './types';

export const Text = ({ variant = 'body-m', color = 'foreground', family, weight, style, ...props }: ITextProps) => {
  const { fontWeight, ...metrics } = typography[variant];
  const isBody = variant.startsWith('body');
  // No `fontWeight` in the style: the weight is carried by the font face itself.
  const fontFamily = fontFace(family ?? (isBody ? 'sans' : 'display'), weight ?? (Number(fontWeight) as FontWeight));

  return (
    <NativeText
      accessibilityRole={isBody ? undefined : 'header'}
      style={[metrics, { fontFamily, color: colors[color] }, style]}
      {...props}
    />
  );
};
