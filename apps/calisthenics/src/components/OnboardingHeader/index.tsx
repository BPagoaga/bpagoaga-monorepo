import Brand from '../Brand';
import type { IOnboardingHeader } from './types';

export type * from './types';

/** First-launch header (MOCK-031): no main navigation, only the brand, the step and a way out. */
const OnboardingHeader = ({ step, steps, label, onSkip }: IOnboardingHeader) => (
  <header className="border-b border-border bg-surface">
    <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-4 px-4">
      <Brand />
      <p className="hidden text-body-s text-muted sm:block">
        Étape {step} sur {steps} · {label}
      </p>
      <button
        type="button"
        onClick={onSkip}
        className="inline-flex min-h-11 items-center px-2 text-body-s font-medium text-muted hover:text-foreground"
      >
        Passer
      </button>
    </div>
  </header>
);

export default OnboardingHeader;
