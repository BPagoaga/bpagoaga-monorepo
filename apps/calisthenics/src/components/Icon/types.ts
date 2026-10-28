import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

export interface IIcon {
  icon: IconDefinition;
  className?: string;
  /** Accessible name; without it the icon is decorative (aria-hidden). */
  title?: string;
}
