import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import type { ReactNode } from 'react';

export interface IEmptyState {
  icon: IconDefinition;
  title: string;
  text: string;
  action?: ReactNode;
}
