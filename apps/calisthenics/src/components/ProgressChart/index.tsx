import { faChartColumn } from '@fortawesome/free-solid-svg-icons';
import Icon from '../Icon';
import type { IProgressChart } from './types';

export type * from './types';

/** CSS bar chart (MOCK-022); the last bar is the current period. Bar heights are data, hence the inline style. */
const ProgressChart = ({ title, subtitle, points, unit = '' }: IProgressChart) => {
  const top = Math.max(0, ...points.map((point) => point.value));
  const empty = top === 0;
  return (
    <section className="min-w-0 rounded-2xl border border-border bg-surface p-5" aria-label={title}>
      <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="text-title-s">{title}</h3>
        {subtitle && <p className="text-body-xs text-subtle">{subtitle}</p>}
      </header>
      {empty ? (
        <div className="mt-4 grid h-44 place-items-center rounded-xl border border-dashed border-border text-center">
          <div>
            <Icon icon={faChartColumn} className="mx-auto size-6 text-neutral-50" />
            <p className="mt-2 text-body-s text-muted">
              Pas encore de données.
              <br />
              Enregistre une séance pour voir ta progression.
            </p>
          </div>
        </div>
      ) : (
        <ol className="mt-4 flex h-44 items-end gap-1 sm:gap-2">
          {points.map((point, index) => {
            const last = index === points.length - 1;
            return (
              <li
                key={point.label}
                className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5"
              >
                <span className={`text-body-xs font-semibold ${last ? 'text-foreground' : 'text-subtle'}`}>
                  {point.value}
                  {unit}
                </span>
                <span
                  className={`w-full max-w-10 rounded-t-md ${last ? 'bg-accent-100' : 'bg-primary-30 group-hover:bg-primary-50'}`}
                  style={{ height: `${Math.round((point.value / top) * 100)}%` }}
                />
                <span className="text-body-xs text-subtle">{point.label}</span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
};

export default ProgressChart;
