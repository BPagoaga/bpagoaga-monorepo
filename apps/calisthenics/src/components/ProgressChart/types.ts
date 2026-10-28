import type { IChartPoint } from '../../domain/types';

export interface IProgressChart {
  title: string;
  subtitle?: string;
  points: IChartPoint[];
  unit?: string;
}
