import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

export type Trend = 'up' | 'down' | 'flat';

export interface IStatCard {
  label: string;
  value: string;
  unit: string;
  icon: IconDefinition;
  delta?: string;
  trend?: Trend;
  caption?: string;
}

/** Label, icon and colour of a status shown next to an icon (never by colour alone). */
export interface IIconLabel {
  label: string;
  icon: IconDefinition;
  className: string;
}
