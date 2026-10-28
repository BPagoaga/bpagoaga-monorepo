import type { ISessionTemplate } from '@bpagoaga/calisthenics-core/domain/types';

export interface ITemplateForm {
  /** Undefined when creating a template. */
  template?: ISessionTemplate;
  days: string[];
}
