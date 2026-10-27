import { StyleSheet, View } from 'react-native';
import { space } from '../../space';
import { colors } from '../../tokens';
import { Text } from '../Text';
import type { IBadgeProps } from './types';

export * from './types';

export const Badge = ({ label, tone = 'neutral' }: IBadgeProps) => (
  <View style={[styles.badge, { backgroundColor: colors[`${tone}-20`] }]}>
    <Text variant="body-xs" weight={600} color={`${tone}-130`}>
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: space(2),
    paddingVertical: space(0.5),
    // Pill shape (the web's `rounded-full`).
    borderRadius: 999,
  },
});
