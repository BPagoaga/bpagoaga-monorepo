import type { ReactNode } from 'react';

export interface IPageLayout {
  children: ReactNode;
  /** Tailwind classes of the content column, `space-y-8` by default. */
  className?: string;
}
