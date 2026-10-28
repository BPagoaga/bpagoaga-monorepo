import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

export interface INavItem {
  to: string;
  label: string;
  short: string;
  icon: IconDefinition;
}
