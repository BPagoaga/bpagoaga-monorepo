import { faShuffle } from '@fortawesome/free-solid-svg-icons';
import Icon from '../Icon';
import RadioMark from '../RadioMark';
import type { IFreeSessionCard } from './types';

export type * from './types';

/** « Séance libre » choice next to the template radio cards: start from an empty session. */
const FreeSessionCard = ({ name, checked, onChange }: IFreeSessionCard) => (
  <label className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-border bg-surface p-4 hover:border-neutral-60 has-checked:border-solid has-checked:border-accent-100 has-checked:ring-4 has-checked:ring-accent-20 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary-100">
    <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />
    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-neutral-20 text-subtle" aria-hidden="true">
      <Icon icon={faShuffle} className="size-4" />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-title-s">Partir de zéro</span>
      <span className="block text-body-s text-muted">Choisis tes exercices dans la bibliothèque.</span>
    </span>
    <RadioMark />
  </label>
);

export default FreeSessionCard;
