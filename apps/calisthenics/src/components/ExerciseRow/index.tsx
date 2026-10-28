import { faArrowDown, faArrowUp, faCheck, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import Button from '../Button';
import FamilyBadge from '../FamilyBadge';
import Icon from '../Icon';
import type { IExerciseRow } from './types';

export type * from './types';

/** An exercise in a session or template list (MOCK-030): summary, pick or edit mode. */
const ExerciseRow = ({
  name,
  family,
  detail,
  onRemove,
  picked,
  onTogglePick,
  editor,
  onMoveUp,
  onMoveDown,
}: IExerciseRow) => (
  <li
    className={`flex items-center gap-2 rounded-xl border border-border bg-surface p-2 pl-3 ${editor ? 'flex-wrap md:flex-nowrap' : ''}`}
  >
    {(onMoveUp || onMoveDown) && (
      <div className="-ml-1 flex flex-col">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={!onMoveUp}
          className="grid h-6 w-8 place-items-center rounded text-subtle hover:bg-neutral-20 disabled:opacity-30"
          aria-label={`Monter ${name}`}
        >
          <Icon icon={faArrowUp} className="size-3" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={!onMoveDown}
          className="grid h-6 w-8 place-items-center rounded text-subtle hover:bg-neutral-20 disabled:opacity-30"
          aria-label={`Descendre ${name}`}
        >
          <Icon icon={faArrowDown} className="size-3" />
        </button>
      </div>
    )}
    <div className="min-w-0 flex-1">
      <p className="truncate text-body-s font-semibold">{name}</p>
      <div className="mt-0.5 flex min-w-0 items-center gap-2">
        <FamilyBadge family={family} />
        {detail && <span className="truncate font-mono text-body-xs text-muted">{detail}</span>}
      </div>
    </div>
    {editor && <div className="order-last w-full md:order-none md:w-auto">{editor}</div>}
    {onTogglePick ? (
      <button
        type="button"
        onClick={onTogglePick}
        aria-pressed={picked}
        aria-label={`Ajouter ${name}`}
        className="group inline-flex h-11 shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 text-body-s font-semibold text-neutral-130 hover:bg-neutral-20 aria-pressed:border-green-100 aria-pressed:bg-green-10 aria-pressed:text-green-130"
      >
        <Icon icon={picked ? faCheck : faPlus} className="size-3" />
        {picked ? 'Ajouté' : 'Ajouter'}
      </button>
    ) : (
      onRemove && (
        <Button variant="ghost" icon={faXmark} aria-label={`Retirer ${name}`} className="size-11" onClick={onRemove} />
      )
    )}
  </li>
);

export default ExerciseRow;
