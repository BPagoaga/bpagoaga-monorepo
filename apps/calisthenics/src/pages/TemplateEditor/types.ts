import type { ISessionTemplate } from '../../domain/types';

export interface ITemplateForm {
  /** Undefined when creating a template. */
  template?: ISessionTemplate;
  days: string[];
}
