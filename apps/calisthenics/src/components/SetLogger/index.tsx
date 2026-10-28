import { faCheck, faForwardStep, faHourglassHalf, faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import Button from '../Button';
import Icon from '../Icon';
import Stepper from '../Stepper';
import type { ISetLogger } from './types';

export type * from './types';

const RPES = [6, 7, 8, 9, 10];

/**
 * Logs one set during a session (MOCK-026), one hand on the phone between two sets: pre-filled values, big steppers,
 * one main action. Holds (L-sit…) are logged in seconds, per the exercise's measure.
 */
const SetLogger = ({
  exercise,
  setNumber,
  previous,
  initial,
  target,
  restClock,
  pending,
  onValidate,
  onUndo,
  onNext,
}: ISetLogger) => {
  const [value, setValue] = useState(initial.value);
  const [loadKg, setLoadKg] = useState(initial.loadKg);
  const [rpe, setRpe] = useState(initial.rpe);
  const hold = exercise.measure === 'hold';

  return (
    <section
      className="rounded-2xl border border-border bg-surface p-4 shadow-elevation-1 sm:p-5"
      aria-label="Saisie de série"
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-body-xs font-semibold uppercase tracking-wide text-accent-130">
            Série {setNumber}
            {target && <span className="font-normal normal-case text-muted"> · objectif {target}</span>}
          </p>
          <h3 className="text-title-m">{exercise.name}</h3>
        </div>
        {restClock && (
          <p
            className="flex shrink-0 items-center gap-2 rounded-full bg-primary-10 px-3 py-1.5 text-body-s font-semibold text-primary-120"
            role="timer"
            aria-label="Repos écoulé"
          >
            <Icon icon={faHourglassHalf} className="size-3" />
            <span className="font-mono">{restClock}</span>
          </p>
        )}
      </header>
      {previous.length > 0 && (
        <ol className="mt-3 flex flex-wrap items-center gap-1.5 text-body-xs text-muted" aria-label="Séries validées">
          {previous.map((set, index) => (
            <li
              key={`${set}-${index}`}
              className="flex items-center gap-1 rounded-md bg-green-10 px-2 py-1 font-mono text-green-130"
            >
              <Icon icon={faCheck} className="size-2.5" /> {set}
            </li>
          ))}
          {onUndo && (
            <li>
              <button
                type="button"
                onClick={onUndo}
                className="inline-flex min-h-8 items-center gap-1 rounded-md px-2 text-body-xs font-medium text-muted hover:bg-neutral-20"
              >
                <Icon icon={faRotateLeft} className="size-2.5" /> Annuler la dernière
              </button>
            </li>
          )}
        </ol>
      )}
      <div className="mt-4 flex gap-3">
        <Stepper
          id="set-value"
          label={hold ? 'Temps tenu' : exercise.unilateral ? 'Répétitions / jambe' : 'Répétitions'}
          value={value}
          onChange={setValue}
          unit={hold ? 's' : undefined}
          step={hold ? 5 : 1}
        />
        {exercise.weightable && (
          <Stepper id="set-load" label="Lest" value={loadKg} onChange={setLoadKg} unit="kg" step={2.5} />
        )}
      </div>
      <fieldset className="mt-4">
        <legend className="text-body-xs font-medium text-muted">Effort perçu (RPE, facultatif)</legend>
        <div className="mt-1 grid grid-cols-5 gap-1.5">
          {RPES.map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={rpe === r}
              onClick={() => setRpe(rpe === r ? undefined : r)}
              className="h-11 rounded-lg border border-border text-body-s font-semibold text-neutral-130 hover:bg-neutral-20 aria-pressed:border-neutral-150 aria-pressed:bg-neutral-150 aria-pressed:text-white"
            >
              {r}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="mt-5 flex gap-2">
        <Button
          size="lg"
          icon={faCheck}
          className="flex-1"
          loading={pending}
          disabled={value <= 0}
          onClick={() => onValidate({ value, loadKg, rpe })}
        >
          Valider la série
        </Button>
        {onNext && (
          <Button
            variant="secondary"
            size="lg"
            icon={faForwardStep}
            aria-label="Passer à l’exercice suivant"
            onClick={onNext}
          />
        )}
      </div>
    </section>
  );
};

export default SetLogger;
