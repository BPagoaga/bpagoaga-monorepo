import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import type { ExerciseFamilyEnum } from '../../domain/types';
import type { BadgeTone } from '../Badge';

export interface IFamilyMeta {
  label: string;
  tone: BadgeTone;
  icon: IconDefinition;
}

export interface IFamilyBadge {
  family: ExerciseFamilyEnum;
  size?: 'sm' | 'md';
}
