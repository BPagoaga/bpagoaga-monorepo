import Icon from '../Icon';
import type { IEmptyState } from './types';

export type * from './types';

const EmptyState = ({ icon, title, text, action }: IEmptyState) => (
  <div className="rounded-2xl border border-dashed border-border p-8 text-center">
    <div className="mx-auto grid size-12 place-items-center rounded-xl bg-neutral-20 text-subtle" aria-hidden="true">
      <Icon icon={icon} className="size-5" />
    </div>
    <p className="mt-3 text-title-s">{title}</p>
    <p className="mx-auto mt-1 max-w-sm text-body-s text-muted">{text}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;
