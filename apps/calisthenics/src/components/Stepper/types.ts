export interface IStepper {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  step?: number;
  min?: number;
  size?: 'md' | 'lg';
}
