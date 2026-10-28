import type { ReactNode } from 'react';

export interface IAuthLayout {
  title: string;
  intro: string;
  children: ReactNode;
  /** Under the card: the link to the other form. */
  footer: ReactNode;
}
