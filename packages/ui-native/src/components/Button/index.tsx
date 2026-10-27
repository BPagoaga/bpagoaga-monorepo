import { Pressable, StyleSheet } from 'react-native';
import { space } from '../../space';
import { colors, radii } from '../../tokens';
import { Text } from '../Text';
import type { ButtonVariant, IButtonProps, IButtonTone } from './types';

export * from './types';

const TONES: Record<ButtonVariant, IButtonTone> = {
  primary: { background: 'primary-100', pressed: 'primary-120', border: 'primary-100', label: 'white' },
  // accent-100 is too light for white text: dark label, as on the web.
  accent: { background: 'accent-100', pressed: 'accent-80', border: 'accent-100', label: 'neutral-150' },
  secondary: { background: 'surface', pressed: 'surface-muted', border: 'border', label: 'foreground' },
};

export const Button = ({ label, variant = 'primary', disabled, style, ...props }: IButtonProps) => {
  const tone = TONES[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: colors[pressed ? tone.pressed : tone.background], borderColor: colors[tone.border] },
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      <Text variant="body-m" weight={600} color={tone.label}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    // WCAG 2.2 touch target.
    minHeight: 44,
    paddingHorizontal: space(5),
    paddingVertical: space(2),
    borderWidth: 1,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
