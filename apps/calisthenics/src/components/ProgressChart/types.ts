import type { IChartPoint } from '@bpagoaga/calisthenics-core/domain/types';

export interface IProgressChart {
  title: string;
  subtitle?: string;
  points: IChartPoint[];
  unit?: string;
}
