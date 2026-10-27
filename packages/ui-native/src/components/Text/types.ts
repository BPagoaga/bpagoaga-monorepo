import type { TextProps } from 'react-native';
import type { ColorToken, FontFamilyToken, FontWeight, TypographyToken } from '../../types';

export interface ITextProps extends TextProps {
  /** Typography token, as the web's `text-*` classes. */
  variant?: TypographyToken;
  color?: ColorToken;
  /** Defaults to `display` for `display` / `title-*` variants, `sans` for `body-*`. */
  family?: FontFamilyToken;
  /** Overrides the token's weight (the web's `font-semibold` on a body text). */
  weight?: FontWeight;
}
