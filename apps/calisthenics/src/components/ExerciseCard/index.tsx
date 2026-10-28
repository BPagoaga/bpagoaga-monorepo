import { faLock } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router';
import Badge from '../Badge';
import FamilyBadge from '../FamilyBadge';
import Icon from '../Icon';
import LevelDots from '../LevelDots';
import { EXERCISE_STATUSES } from './statuses';
import type { IExerciseCard } from './types';

export type * from './types';

/** A tutorial in the library (MOCK-023). Locked steps stay readable: the card still opens the exercise page. */
const ExerciseCard = ({ exercise, status, target, step, to }: IExerciseCard) => {
  const s = EXERCISE_STATUSES[status];
  const locked = status === 'locked';
  return (
    <article
      className={`relative flex flex-col rounded-2xl border border-border bg-surface p-4 transition hover:border-primary-60 hover:shadow-elevation-2 ${locked ? 'opacity-70' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <FamilyBadge family={exercise.family} />
        <Badge label={s.label} tone={s.tone} icon={s.icon} size="sm" />
      </div>
      <h3 className="mt-3 text-title-s">
        <Link to={to} className="after:absolute after:inset-0 after:rounded-2xl">
          {exercise.name}
        </Link>
      </h3>
      <p className="mt-1 line-clamp-2 flex-1 text-body-s text-muted">{exercise.summary}</p>
      <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3 text-body-xs">
        <div>
          <dt className="text-subtle">Niveau</dt>
          <dd className="mt-0.5">
            <LevelDots level={exercise.level} />
          </dd>
        </div>
        <div>
          <dt className="text-subtle">Objectif</dt>
          <dd className="mt-0.5 font-semibold">{target ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-subtle">Étape</dt>
          <dd className="mt-0.5 font-semibold">{step ?? 'Libre'}</dd>
        </div>
      </dl>
      {locked && (
        <p className="mt-3 flex items-center gap-1.5 text-body-xs text-muted">
          <Icon icon={faLock} className="size-2.5" /> Valide l’étape précédente pour débloquer.
        </p>
      )}
    </article>
  );
};

export default ExerciseCard;
