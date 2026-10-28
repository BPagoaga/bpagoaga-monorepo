import { faArrowRight, faCheck, faTrophy } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import Button from '../../components/Button';
import ErrorMessage from '../../components/ErrorMessage';
import Icon from '../../components/Icon';
import { getExercise } from '../../content/exercises';
import { findStep } from '../../content/progressions';
import { formatDuration, formatRecord, formatTarget } from '../../domain/format';
import { currentStepOf } from '../../domain/progress';
import { personalRecords } from '../../domain/records';
import { meetsCriterion } from '../../domain/sets';
import { useNow } from '../../hooks/useNow';
import { useFetchLevelTests } from '../../queries/levelTests';
import { useFetchProgress, useSetProgressStep } from '../../queries/progress';
import { useFetchSessions } from '../../queries/sessions';
import type { ISummary } from './types';

/** After the session: what passed a step's criterion, which records fell. Validating a step is the user's call. */
const Summary = ({ session }: ISummary) => {
  const sessions = useFetchSessions();
  const progress = useFetchProgress();
  const levelTests = useFetchLevelTests();
  const setStep = useSetProgressStep();
  const [validated, setValidated] = useState<string[]>([]);
  const now = useNow(60_000);

  const steps = session.exercises.flatMap((exercise) => {
    const step = findStep(exercise.exerciseId);
    if (!step || step.index !== currentStepOf(step.progression.id, progress.data ?? [])) return [];
    const { criterion } = step.progression.steps[step.index];
    return meetsCriterion(exercise, criterion) ? [step] : [];
  });
  const doneAts = new Set(session.exercises.flatMap((exercise) => exercise.sets.map((set) => set.doneAt)));
  const records = personalRecords(sessions.data ?? [], levelTests.data ?? [], now).filter((record) =>
    doneAts.has(record.date),
  );
  const setCount = session.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);

  return (
    <div className="space-y-6">
      <header>
        <p className="flex items-center gap-1.5 text-body-xs font-semibold uppercase tracking-wide text-green-120">
          <Icon icon={faCheck} className="size-3" /> Séance enregistrée
        </p>
        <h1 className="mt-1 font-display text-title-xl">{session.title}</h1>
        <p className="mt-1 text-body-m text-muted">
          {session.endedAt &&
            formatDuration(new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime())}{' '}
          · {setCount} série{setCount > 1 ? 's' : ''}
        </p>
      </header>

      {steps.map(({ progression, index }) => {
        const next = progression.steps[index + 1];
        const exercise = getExercise(progression.steps[index].exerciseId);
        const done = validated.includes(progression.id);
        return (
          <section
            key={progression.id}
            className="rounded-2xl border border-accent-100 bg-accent-10 p-5"
            aria-label={progression.name}
          >
            <p className="text-body-xs font-semibold uppercase tracking-wide text-accent-140">
              Critère atteint · {progression.name}
            </p>
            <p className="mt-1 text-title-s">
              {exercise?.name} : {formatTarget(progression.steps[index].criterion, exercise)}
            </p>
            <p className="mt-1 text-body-s text-muted">
              Si toutes les répétitions étaient propres, valide l’étape
              {next ? ` pour débloquer ${getExercise(next.exerciseId)?.name}.` : ' : c’est la dernière de la figure.'}
            </p>
            <div className="mt-3">
              {done ? (
                <p className="flex items-center gap-2 text-body-s font-semibold text-green-120">
                  <Icon icon={faCheck} className="size-3" /> Étape validée
                </p>
              ) : (
                <Button
                  variant="accent"
                  icon={faCheck}
                  loading={setStep.isPending}
                  onClick={() =>
                    setStep.mutate(
                      { progressionId: progression.id, step: index + 1, source: 'criterion', sessionId: session.id },
                      { onSuccess: () => setValidated([...validated, progression.id]) },
                    )
                  }
                >
                  Valider l’étape
                </Button>
              )}
            </div>
          </section>
        );
      })}
      <ErrorMessage error={setStep.error} />

      {records.length > 0 && (
        <section className="rounded-2xl border border-border bg-surface p-5" aria-labelledby="new-records">
          <h2 id="new-records" className="text-title-s">
            Nouveaux records
          </h2>
          <ul className="mt-3 space-y-2">
            {records.map((record) => (
              <li key={record.exerciseId} className="flex items-center gap-3 text-body-s">
                <Icon icon={faTrophy} className="size-3.5 text-accent-130" />
                <span className="flex-1 font-semibold">{getExercise(record.exerciseId)?.name}</span>
                <span className="font-mono">{formatRecord(record.set)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-wrap gap-2">
        <Button iconRight={faArrowRight} to="/">
          Tableau de bord
        </Button>
        <Button variant="ghost" to="/journal">
          Voir le journal
        </Button>
      </div>
    </div>
  );
};

export default Summary;
