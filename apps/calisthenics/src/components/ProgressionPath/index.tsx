import { faCheck, faCircleCheck, faCircleDot, faLock } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router';
import Icon from '../Icon';
import type { IProgressionPath, IStepName } from './types';

export type * from './types';

const StepName = ({ step, className }: IStepName) =>
  step.to ? (
    <Link to={step.to} className={`${className} hover:underline`}>
      {step.name}
    </Link>
  ) : (
    <span className={className}>{step.name}</span>
  );

/** A figure's path, step by step, with each step's criterion (MOCK-024). */
const ProgressionPath = ({ title, steps, orientation = 'vertical' }: IProgressionPath) => (
  <section aria-label={title}>
    <ol className={orientation === 'horizontal' ? 'flex gap-3 overflow-x-auto pb-2' : ''}>
      {steps.map((step, index) => {
        const done = step.status === 'done';
        const current = step.status === 'current';
        if (orientation === 'horizontal') {
          return (
            <li
              key={step.name}
              className={`min-w-44 flex-1 rounded-xl border p-3 ${current ? 'border-accent-100 bg-accent-10' : 'border-border bg-surface'}`}
              aria-current={current ? 'step' : undefined}
            >
              <p
                className={`flex items-center gap-2 text-body-xs font-semibold ${done ? 'text-green-120' : current ? 'text-accent-140' : 'text-subtle'}`}
              >
                <Icon icon={done ? faCircleCheck : current ? faCircleDot : faLock} className="size-3" />
                Étape {index + 1}
                <span className="sr-only">{done ? ', validée' : current ? ', en cours' : ', verrouillée'}</span>
              </p>
              <p className="mt-1 text-body-s font-semibold">
                <StepName step={step} className={step.status === 'locked' ? 'text-subtle' : ''} />
              </p>
              <p className="mt-0.5 text-body-xs text-muted">{step.criterion}</p>
            </li>
          );
        }
        return (
          <li
            key={step.name}
            className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3"
            aria-current={current ? 'step' : undefined}
          >
            <div className="flex flex-col items-center">
              <span
                className={`grid size-8 shrink-0 place-items-center rounded-full text-body-xs font-bold ${done ? 'bg-green-100 text-white' : current ? 'bg-accent-100 text-neutral-150 ring-4 ring-accent-20' : 'bg-neutral-20 text-subtle'}`}
              >
                {done ? (
                  <>
                    <Icon icon={faCheck} className="size-3" />
                    <span className="sr-only">Validée</span>
                  </>
                ) : (
                  index + 1
                )}
              </span>
              {index < steps.length - 1 && (
                <span
                  className={`my-1 w-0.5 flex-1 rounded-full ${done ? 'bg-green-100' : 'bg-neutral-30'}`}
                  aria-hidden="true"
                />
              )}
            </div>
            <div className="pt-1 pb-5">
              <p className="text-body-m font-semibold">
                <StepName step={step} className={step.status === 'locked' ? 'text-subtle' : ''} />
                {current && (
                  <span className="ml-1 rounded-full bg-accent-10 px-2 py-0.5 text-body-xs font-semibold text-accent-140">
                    En cours
                  </span>
                )}
              </p>
              <p className="text-body-s text-muted">{step.criterion}</p>
            </div>
          </li>
        );
      })}
    </ol>
  </section>
);

export default ProgressionPath;
