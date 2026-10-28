import { faCircle, faCircleCheck, faFlagCheckered, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { EXERCISES, getExercise } from '../../content/exercises';
import { formatClock, formatSet, formatTarget } from '../../domain/format';
import type { ISession } from '../../domain/types';
import { useNow } from '../../hooks/useNow';
import { useAddSessionExercise, useLogSet, useRemoveLastSet } from '../../queries/sessions';
import Button from '../Button';
import ErrorMessage from '../ErrorMessage';
import Icon from '../Icon';
import SetLogger, { type ISetEntry } from '../SetLogger';
import type { ICurrentSessionPanel } from './types';

export type * from './types';

const firstUnfinished = (session: ISession) => {
  const index = session.exercises.findIndex((exercise) => exercise.sets.length < (exercise.target?.sets ?? 3));
  return index === -1 ? 0 : index;
};

/** The session in progress (MOCK-202): set logger of the active exercise, then the session's exercise list. */
const CurrentSessionPanel = ({ session, compact = false }: ICurrentSessionPanel) => {
  const now = useNow();
  const [active, setActive] = useState(() => firstUnfinished(session));
  const [adding, setAdding] = useState('');
  const logSet = useLogSet();
  const removeLastSet = useRemoveLastSet();
  const addExercise = useAddSessionExercise();

  const current = session.exercises[active];
  const exercise = current && getExercise(current.exerciseId);
  const lastSet = current?.sets.at(-1);
  const allDoneAts = session.exercises.flatMap((e) => e.sets.map((set) => set.doneAt)).sort();
  const lastDoneAt = allDoneAts.at(-1);
  const hold = exercise?.measure === 'hold';
  const targetValue = hold
    ? current?.target?.seconds
    : typeof current?.target?.reps === 'number'
      ? current.target.reps
      : undefined;
  const initial: ISetEntry = {
    value: (hold ? lastSet?.seconds : lastSet?.reps) ?? targetValue ?? (hold ? 20 : 8),
    loadKg: lastSet?.loadKg ?? current?.target?.loadKg ?? 0,
  };

  const validate = (entry: ISetEntry) => {
    if (!exercise) return;
    logSet.mutate(
      {
        id: session.id,
        exerciseIndex: active,
        set: {
          ...(hold ? { seconds: entry.value } : { reps: entry.value }),
          ...(entry.loadKg ? { loadKg: entry.loadKg } : {}),
          ...(entry.rpe ? { rpe: entry.rpe } : {}),
        },
      },
      {
        // Move on once the target's sets are done.
        onSuccess: (updated) => {
          const sets = updated.exercises[active].sets.length;
          if (sets >= (current.target?.sets ?? Infinity) && active < updated.exercises.length - 1)
            setActive(active + 1);
        },
      },
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="min-w-0 truncate text-title-s">
          Séance en cours <span className="font-normal text-muted">· {session.title}</span>
        </h2>
        <p className="shrink-0 font-mono text-body-s text-muted" role="timer" aria-label="Durée de la séance">
          {formatClock(now.getTime() - new Date(session.startedAt).getTime())}
        </p>
      </div>

      {exercise ? (
        <SetLogger
          key={`${session.id}-${active}-${current.sets.length}`}
          exercise={exercise}
          setNumber={current.sets.length + 1}
          previous={current.sets.map(formatSet)}
          initial={initial}
          target={current.target && formatTarget(current.target, exercise)}
          restClock={lastDoneAt ? formatClock(now.getTime() - new Date(lastDoneAt).getTime()) : undefined}
          pending={logSet.isPending}
          onValidate={validate}
          onUndo={
            current.sets.length ? () => removeLastSet.mutate({ id: session.id, exerciseIndex: active }) : undefined
          }
          onNext={active < session.exercises.length - 1 ? () => setActive(active + 1) : undefined}
        />
      ) : (
        <p className="rounded-2xl border border-dashed border-border p-6 text-center text-body-s text-muted">
          Ajoute un premier exercice pour commencer.
        </p>
      )}
      <ErrorMessage error={logSet.error ?? removeLastSet.error ?? addExercise.error} />

      <ol className="space-y-1.5 text-body-s" aria-label="Exercices de la séance">
        {session.exercises.map((entry, index) => {
          const done = entry.sets.length >= (entry.target?.sets ?? Infinity);
          const isActive = index === active;
          return (
            <li key={`${entry.exerciseId}-${index}`}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-current={isActive ? 'step' : undefined}
                className={`flex min-h-11 w-full items-center gap-2 rounded-lg px-3 py-2 text-left ${isActive ? 'bg-primary-10 font-semibold text-primary-120' : 'bg-surface hover:bg-neutral-20'} ${done && !isActive ? 'text-muted' : ''}`}
              >
                <Icon
                  icon={done ? faCircleCheck : faCircle}
                  className={`size-3.5 ${done ? 'text-green-110' : 'text-neutral-50'}`}
                />
                <span className="min-w-0 flex-1 truncate">
                  {getExercise(entry.exerciseId)?.name ?? entry.exerciseId}
                </span>
                <span className="shrink-0 font-mono text-body-xs">
                  {entry.sets.length}
                  {entry.target ? `/${entry.target.sets}` : ''}
                  <span className="sr-only"> séries</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!adding) return;
          addExercise.mutate(
            { id: session.id, exerciseId: adding },
            {
              onSuccess: () => {
                setAdding('');
                setActive(session.exercises.length);
              },
            },
          );
        }}
      >
        <label className="sr-only" htmlFor={`add-${session.id}`}>
          Exercice à ajouter
        </label>
        <select
          id={`add-${session.id}`}
          value={adding}
          onChange={(event) => setAdding(event.target.value)}
          className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-surface px-2 text-body-s focus:border-primary-100 focus:outline-hidden focus:ring-4 focus:ring-primary-20"
        >
          <option value="">Ajouter un exercice…</option>
          {EXERCISES.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        <Button
          type="submit"
          variant="secondary"
          icon={faPlus}
          disabled={!adding}
          loading={addExercise.isPending}
          aria-label="Ajouter l’exercice"
          className="size-11"
        />
      </form>

      <Button variant="ghost" icon={faFlagCheckered} to="/seance/fin" className={`w-full ${compact ? '' : 'mt-2'}`}>
        Terminer la séance
      </Button>
    </div>
  );
};

export default CurrentSessionPanel;
