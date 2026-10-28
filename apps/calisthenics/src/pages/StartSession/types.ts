import type { ISession, ISessionTemplate, ITemplateItem } from '@bpagoaga/calisthenics-core/domain/types';

export type Choice =
  | { kind: 'template'; id: string }
  | { kind: 'recent'; id: string }
  | { kind: 'free' }
  | { kind: 'none' };

export interface IChoiceOption {
  title: string;
  templateId?: string;
  items: ITemplateItem[];
}

export type InitialChoice = Choice & { items?: ITemplateItem[] };

export interface IStartSessionForm {
  templates: ISessionTemplate[];
  recent: ISession[];
  initial: InitialChoice;
  /** Today's planned template, if not done yet. */
  todayId?: string;
}
