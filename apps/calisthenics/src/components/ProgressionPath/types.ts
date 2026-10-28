import type { StepStatusEnum } from '../../domain/types';

export interface IPathStep {
  name: string;
  criterion: string;
  status: StepStatusEnum;
  to?: string;
}

export interface IProgressionPath {
  title: string;
  steps: IPathStep[];
  orientation?: 'vertical' | 'horizontal';
}

export interface IStepName {
  step: IPathStep;
  className: string;
}
