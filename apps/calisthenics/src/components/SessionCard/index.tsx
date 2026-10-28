import {
  faChevronDown,
  faClock,
  faFaceGrinStars,
  faFaceSmile,
  faFaceTired,
  faNoteSticky,
  faTrash,
  faTrophy,
} from '@fortawesome/free-solid-svg-icons';
import { useId, useState } from 'react';
import { getExercise } from '../../content/exercises';
import { formatDuration, formatLongDay, formatSet, formatWeekday } from '../../domain/format';
import type { FeelingEnum } from '../../domain/types';
import Icon from '../Icon';
import type { IIconLabel, ISessionCard } from './types';

export type * from './types';

const FEELINGS: Record<FeelingEnum, IIconLabel> = {
  great: { icon: faFaceGrinStars, label: 'Excellente', className: 'text-green-110' },
  ok: { icon: faFaceSmile, label: 'Correcte', className: 'text-primary-100' },
  hard: { icon: faFaceTired, label: 'Difficile', className: 'text-orange-120' },
};

/** A journal entry (MOCK-025): header with date, title and summary, then each exercise with its sets. */
const SessionCard = ({ session, records = [], defaultCollapsed = false, onDelete }: ISessionCard) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const detailId = useId();
  const date = new Date(session.startedAt);
  const feeling = session.feeling && FEELINGS[session.feeling];
  const setCount = session.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
  const isRecord = (exerciseId: string, doneAts: string[]) =>
    records.some((record) => record.exerciseId === exerciseId && doneAts.includes(record.date));

  return (
    <article className="rounded-2xl border border-border bg-surface">
      <header className="flex items-start gap-3 p-4 sm:p-5">
        <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-neutral-20 text-center leading-none">
          <span className="text-body-xs uppercase text-muted">{formatWeekday(date)}</span>
          <span className="font-display text-title-s">{date.getDate()}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-title-s">{session.title}</h3>
          <p className="sr-only">{formatLongDay(date)}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-body-xs text-muted">
            {session.endedAt && (
              <span className="inline-flex items-center gap-1">
                <Icon icon={faClock} className="size-3" />
                {formatDuration(new Date(session.endedAt).getTime() - date.getTime())}
              </span>
            )}
            <span>
              {session.exercises.length} exercice{session.exercises.length > 1 ? 's' : ''} · {setCount} série
              {setCount > 1 ? 's' : ''}
            </span>
            {session.rpe && <span>RPE {session.rpe}/10</span>}
            {feeling && (
              <span className={`inline-flex items-center gap-1 ${feeling.className}`}>
                <Icon icon={feeling.icon} className="size-3" />
                {feeling.label}
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="grid size-11 shrink-0 place-items-center rounded-md text-subtle hover:bg-neutral-20"
          aria-expanded={!collapsed}
          aria-controls={detailId}
          aria-label={collapsed ? 'Afficher le détail de la séance' : 'Masquer le détail de la séance'}
        >
          <Icon icon={faChevronDown} className={`size-3.5 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
        </button>
      </header>
      <div id={detailId} hidden={collapsed} className="border-t border-border">
        <ul className="divide-y divide-border">
          {session.exercises.map((exercise, index) => (
            <li
              key={`${exercise.exerciseId}-${index}`}
              className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-5"
            >
              <p className="shrink-0 text-body-s font-semibold sm:w-44">
                {getExercise(exercise.exerciseId)?.name ?? exercise.exerciseId}
                {isRecord(
                  exercise.exerciseId,
                  exercise.sets.map((set) => set.doneAt),
                ) && (
                  <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-accent-10 px-1.5 py-0.5 text-body-xs font-semibold text-accent-140">
                    <Icon icon={faTrophy} className="size-2.5" />
                    Record
                  </span>
                )}
              </p>
              {exercise.sets.length ? (
                <ol className="flex flex-wrap gap-1.5" aria-label="Séries">
                  {exercise.sets.map((set) => (
                    <li
                      key={set.doneAt}
                      className="rounded-md bg-neutral-20 px-2 py-1 font-mono text-body-xs text-neutral-140"
                    >
                      {formatSet(set)}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-body-xs text-subtle">Pas de série</p>
              )}
            </li>
          ))}
        </ul>
        {session.notes && (
          <p className="flex gap-2 border-t border-border px-4 py-3 text-body-s text-muted italic sm:px-5">
            <Icon icon={faNoteSticky} className="mt-1 size-3" />
            {session.notes}
          </p>
        )}
        {onDelete && (
          <div className="border-t border-border px-4 py-2 sm:px-5">
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex min-h-11 items-center gap-2 text-body-s font-medium text-red-110 hover:underline"
            >
              <Icon icon={faTrash} className="size-3" />
              Supprimer la séance
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

export default SessionCard;
