export type BadgeTone = 'primary' | 'accent' | 'neutral' | 'green' | 'orange' | 'red' | 'blue';

export interface IBadgeProps {
  label: string;
  tone?: BadgeTone;
}
