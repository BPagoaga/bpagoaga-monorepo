import { faArrowTrendDown, faArrowTrendUp, faMinus } from '@fortawesome/free-solid-svg-icons';
import Icon from '../Icon';
import type { IIconLabel, IStatCard, Trend } from './types';

export type * from './types';

const TRENDS: Record<Trend, IIconLabel> = {
  up: { className: 'bg-green-10 text-green-130', icon: faArrowTrendUp, label: 'en hausse' },
  down: { className: 'bg-red-10 text-red-120', icon: faArrowTrendDown, label: 'en baisse' },
  flat: { className: 'bg-neutral-20 text-neutral-120', icon: faMinus, label: 'stable' },
};

const StatCard = ({ label, value, unit, icon, delta, trend = 'flat', caption }: IStatCard) => {
  const t = TRENDS[trend];
  return (
    <article className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-body-s font-medium text-muted">{label}</p>
        <span className="grid size-8 place-items-center rounded-lg bg-neutral-20 text-neutral-120" aria-hidden="true">
          <Icon icon={icon} className="size-3.5" />
        </span>
      </div>
      <p className="mt-3 font-display text-title-xl">
        {value}
        <span className="ml-1 font-sans text-body-m font-medium text-muted">{unit}</span>
      </p>
      {delta && (
        <p className="mt-2 flex flex-wrap items-center gap-2 text-body-xs text-muted">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${t.className}`}>
            <Icon icon={t.icon} className="size-3" />
            <span className="sr-only">{t.label}</span>
            {delta}
          </span>
          {caption}
        </p>
      )}
    </article>
  );
};

export default StatCard;
