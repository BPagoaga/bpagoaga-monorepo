import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import type { IRecord, ISession } from '../../domain/types';

export interface ISessionCard {
  session: ISession;
  records?: IRecord[];
  defaultCollapsed?: boolean;
  onDelete?: () => void;
}

/** Label, icon and colour of a status shown next to an icon (never by colour alone). */
export interface IIconLabel {
  label: string;
  icon: IconDefinition;
  className: string;
}
