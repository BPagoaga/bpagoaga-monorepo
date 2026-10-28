import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import Icon from '../Icon';
import type { IStepper } from './types';

export type * from './types';

/** Thumb-sized number input (MOCK-027): −/+ buttons around a value editable with the numeric keyboard. */
const Stepper = ({ id, label, value, onChange, unit, step = 1, min = 0, size = 'md' }: IStepper) => {
  const buttonSize = size === 'lg' ? 'size-16' : 'size-12';
  const set = (next: number) => onChange(Math.max(min, Number.isFinite(next) ? next : min));
  return (
    <div className="min-w-0 flex-1">
      <label htmlFor={id} className="text-body-xs font-medium text-muted">
        {label}
      </label>
      <div className="mt-1 flex items-center rounded-xl border border-border bg-surface focus-within:border-primary-100 focus-within:ring-4 focus-within:ring-primary-20">
        <button
          type="button"
          onClick={() => set(value - step)}
          disabled={value <= min}
          className={`grid ${buttonSize} shrink-0 place-items-center rounded-l-xl text-neutral-130 hover:bg-neutral-20 disabled:text-neutral-60`}
          aria-label={`Diminuer ${label.toLowerCase()}`}
        >
          <Icon icon={faMinus} />
        </button>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(event) => set(Number(event.target.value.replace(',', '.')))}
          onFocus={(event) => event.target.select()}
          className={`w-full min-w-0 bg-transparent text-center font-display outline-none ${size === 'lg' ? 'text-display' : 'text-title-m'}`}
        />
        {unit && <span className="pr-1 text-body-xs text-subtle">{unit}</span>}
        <button
          type="button"
          onClick={() => set(value + step)}
          className={`grid ${buttonSize} shrink-0 place-items-center rounded-r-xl text-neutral-130 hover:bg-neutral-20`}
          aria-label={`Augmenter ${label.toLowerCase()}`}
        >
          <Icon icon={faPlus} />
        </button>
      </div>
    </div>
  );
};

export default Stepper;
