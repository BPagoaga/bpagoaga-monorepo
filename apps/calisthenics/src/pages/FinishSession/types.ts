import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import type { FeelingEnum, ISession } from '@bpagoaga/calisthenics-core/domain/types';

export interface ISummary {
  session: ISession;
}

export interface IFeelingOption {
  value: FeelingEnum;
  label: string;
  icon: IconDefinition;
}
