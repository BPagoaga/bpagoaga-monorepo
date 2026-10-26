export interface IToken {
  /** Token name without the leading `--` and the namespace (`primary-100`, `title-l`). */
  name: string;
  /** CSS custom property (`--color-primary-100`). */
  variable: string;
  value: string;
}

export interface IColorScale {
  name: string;
  shades: IToken[];
}

export interface ISwatch {
  token: IToken;
  label: string;
}
