import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

export type BadgeTone = 'neutral' | 'primary' | 'accent' | 'green' | 'orange' | 'red' | 'blue';

export interface IBadge {
  label: string;
  tone?: BadgeTone;
  icon?: IconDefinition;
  size?: 'sm' | 'md';
}
