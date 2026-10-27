import { StyleSheet, View } from 'react-native';
import { space } from '../../space';
import { colors, radii, shadows } from '../../tokens';
import type { ICardProps } from './types';

export * from './types';

export const Card = ({ elevation = 1, style, ...props }: ICardProps) => (
  <View style={[styles.card, { boxShadow: shadows[`elevation-${elevation}`] }, style]} {...props} />
);

const styles = StyleSheet.create({
  card: {
    gap: space(2),
    padding: space(4),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
  },
});
