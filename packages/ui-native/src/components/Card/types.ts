import type { ViewProps } from 'react-native';

export interface ICardProps extends ViewProps {
  /** `shadow-elevation-*` token. */
  elevation?: 1 | 2 | 3;
}
