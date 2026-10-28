import type { ITextField } from './types';

export type * from './types';

/** Labelled text input, full width, 44 px tall. */
const TextField = ({ id, label, hint, className = '', ...input }: ITextField) => (
  <div className={className}>
    <label htmlFor={id} className="block text-body-s font-semibold">
      {label}
    </label>
    <input
      id={id}
      aria-describedby={hint ? `${id}-hint` : undefined}
      className="mt-1 h-11 w-full rounded-lg border border-border bg-surface px-3 text-body-m focus:border-primary-100 focus:outline-hidden focus:ring-4 focus:ring-primary-20"
      {...input}
    />
    {hint && (
      <p id={`${id}-hint`} className="mt-1 text-body-xs text-muted">
        {hint}
      </p>
    )}
  </div>
);

export default TextField;
