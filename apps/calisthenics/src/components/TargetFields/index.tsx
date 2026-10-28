import type { ITargetFields } from './types';

export type * from './types';

const inputClass =
  'h-11 w-16 rounded-lg border border-border bg-surface px-2 text-center font-mono text-body-s focus:border-primary-100 focus:outline-hidden focus:ring-4 focus:ring-primary-20';

const toNumber = (raw: string) => Math.max(0, Number(raw.replace(',', '.')) || 0);

/** Structured target of a template item: sets × reps (or « max ») / seconds, plus load when the exercise allows it. */
const TargetFields = ({ idPrefix, exercise, target, onChange }: ITargetFields) => {
  const hold = exercise.measure === 'hold';
  return (
    <fieldset className="flex flex-wrap items-center gap-2">
      <legend className="sr-only">Objectif pour {exercise.name}</legend>
      <label className="sr-only" htmlFor={`${idPrefix}-sets`}>
        Séries
      </label>
      <input
        id={`${idPrefix}-sets`}
        inputMode="numeric"
        value={target.sets}
        onChange={(event) => onChange({ ...target, sets: Math.max(1, toNumber(event.target.value)) })}
        className={inputClass}
      />
      <span className="text-body-s text-muted" aria-hidden="true">
        ×
      </span>
      <label className="sr-only" htmlFor={`${idPrefix}-value`}>
        {hold ? 'Secondes' : 'Répétitions (vide = max)'}
      </label>
      <input
        id={`${idPrefix}-value`}
        inputMode="numeric"
        placeholder={hold ? '' : 'max'}
        value={hold ? (target.seconds ?? '') : target.reps === 'max' ? '' : (target.reps ?? '')}
        onChange={(event) =>
          hold
            ? onChange({ ...target, seconds: toNumber(event.target.value) })
            : onChange({ ...target, reps: event.target.value.trim() ? toNumber(event.target.value) : 'max' })
        }
        className={inputClass}
      />
      <span className="text-body-xs text-muted">{hold ? 's' : exercise.unilateral ? '/ jambe' : 'reps'}</span>
      {exercise.weightable && (
        <>
          <label className="sr-only" htmlFor={`${idPrefix}-load`}>
            Lest en kilos
          </label>
          <span className="text-body-xs text-muted" aria-hidden="true">
            +
          </span>
          <input
            id={`${idPrefix}-load`}
            inputMode="decimal"
            value={target.loadKg ?? ''}
            placeholder="0"
            onChange={(event) => onChange({ ...target, loadKg: toNumber(event.target.value) || undefined })}
            className={inputClass}
          />
          <span className="text-body-xs text-muted">kg</span>
        </>
      )}
    </fieldset>
  );
};

export default TargetFields;
