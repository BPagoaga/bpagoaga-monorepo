import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import type { ISessionTemplate, IWeekDay } from '@bpagoaga/calisthenics-core/domain/types';

export interface IWeekPlanner {
  days: IWeekDay[];
  templates: ISessionTemplate[];
  /** Plan mode (Programme page): one select per day. Without it, a read-only strip. */
  onChange?: (dayIndex: number, templateId: string | null) => void;
  disabled?: boolean;
}

/** Label, icon and colour of a status shown next to an icon (never by colour alone). */
export interface IIconLabel {
  label: string;
  icon: IconDefinition;
  className: string;
}
