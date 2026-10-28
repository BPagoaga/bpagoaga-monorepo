export interface IOnboardingHeader {
  step: number;
  steps: number;
  label: string;
  onSkip: () => void;
}
