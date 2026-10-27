import type { PressableProps, StyleProp, ViewStyle } from 'react-native';
import type { ColorToken } from '../../types';

export type ButtonVariant = 'primary' | 'accent' | 'secondary';

export interface IButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
}

export interface IButtonTone {
  background: ColorToken;
  pressed: ColorToken;
  border: ColorToken;
  label: ColorToken;
}
