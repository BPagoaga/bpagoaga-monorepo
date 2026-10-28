import type { ExerciseFamilyEnum } from '../../domain/types';

export interface ICardLine {
  name: string;
  detail: string;
}

export interface ISessionTemplateCard {
  title: string;
  subtitle: string;
  lines: ICardLine[];
  family?: ExerciseFamilyEnum;
  /** Highlighted label above the title (« Programme · Jeudi 22 octobre »). */
  badge?: string;
  footnote?: string;
  /** Manage mode (Programme page). */
  editTo?: string;
  onDuplicate?: () => void;
  /** Choose mode (start a session): the card is the label of a radio input. */
  radio?: { name: string; checked: boolean; onChange: () => void };
}
