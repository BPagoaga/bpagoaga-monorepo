import { faMagnifyingGlass, faPlay } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import Button from '../../components/Button';
import ExerciseCard from '../../components/ExerciseCard';
import { FAMILIES } from '../../components/FamilyBadge/families';
import Icon from '../../components/Icon';
import Loading from '../../components/Loading';
import PageLayout from '../../components/PageLayout';
import ProgressionPath from '../../components/ProgressionPath';
import { EXERCISES, getExercise } from '@bpagoaga/calisthenics-core/content/exercises';
import { findStep, getProgression, PROGRESSIONS } from '@bpagoaga/calisthenics-core/content/progressions';
import { formatTarget } from '@bpagoaga/calisthenics-core/domain/format';
import { currentStepOf, exerciseStatus, stepStatus } from '@bpagoaga/calisthenics-core/domain/progress';
import type { ExerciseFamilyEnum } from '@bpagoaga/calisthenics-core/domain/types';
import { useFetchProfile, useFetchProgress, useFetchSessions } from '@bpagoaga/calisthenics-api-client';
import type { IFamilyTab } from './types';

const TABS: IFamilyTab[] = [
  { id: 'all', label: 'Tous' },
  ...(Object.entries(FAMILIES) as [ExerciseFamilyEnum, (typeof FAMILIES)[ExerciseFamilyEnum]][]).map(([id, meta]) => ({
    id,
    label: meta.label,
  })),
];

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

/** Tutorials (MOCK-201): the goal's progression first, then the library filtered by family. */
const Tutorials = () => {
  const profile = useFetchProfile();
  const progress = useFetchProgress();
  const sessions = useFetchSessions();
  const [family, setFamily] = useState<ExerciseFamilyEnum | 'all'>('all');
  const [query, setQuery] = useState('');

  if (profile.isPending || progress.isPending || sessions.isPending) {
    return (
      <PageLayout>
        <Loading />
      </PageLayout>
    );
  }
  const progressList = progress.data ?? [];
  const goal = getProgression(profile.data?.goalProgressionId ?? 'muscle-up') ?? PROGRESSIONS[0];
  const goalStep = currentStepOf(goal.id, progressList);
  const resumeId = goal.steps[Math.min(goalStep, goal.steps.length - 1)].exerciseId;
  const list = EXERCISES.filter(
    (exercise) =>
      (family === 'all' || exercise.family === family) && normalize(exercise.name).includes(normalize(query.trim())),
  );

  return (
    <PageLayout>
      <header>
        <h1 className="font-display text-title-xl">Tutoriels</h1>
        <p className="mt-1 text-body-m text-muted">
          Des exercices rangés en progressions : chaque étape débloque la suivante.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-surface p-5 md:p-6" aria-labelledby="path-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-body-xs font-semibold uppercase tracking-wide text-accent-130">
              Ta progression en cours
            </p>
            <h2 id="path-title" className="text-title-m">
              {goal.name}
            </h2>
          </div>
          <Button variant="accent" icon={faPlay} to={`/tutoriels/${resumeId}`}>
            {goalStep < goal.steps.length ? `Reprendre l’étape ${goalStep + 1}` : 'Revoir la figure'}
          </Button>
        </div>
        <div className="mt-5">
          <ProgressionPath
            title={goal.name}
            orientation="horizontal"
            steps={goal.steps.map((step, index) => {
              const exercise = getExercise(step.exerciseId);
              return {
                name: exercise?.name ?? step.exerciseId,
                criterion: formatTarget(step.criterion, exercise),
                status: stepStatus(index, goalStep),
                to: `/tutoriels/${step.exerciseId}`,
              };
            })}
          />
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="library-title">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 id="library-title" className="text-title-m">
            Bibliothèque <span className="text-body-m font-normal text-muted">· {EXERCISES.length} exercices</span>
          </h2>
          <div className="relative md:w-72">
            <Icon
              icon={faMagnifyingGlass}
              className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-subtle"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un exercice"
              aria-label="Rechercher un exercice"
              className="h-11 w-full rounded-lg border border-border bg-surface pr-3 pl-9 text-body-s focus:border-primary-100 focus:outline-hidden focus:ring-4 focus:ring-primary-20"
            />
          </div>
        </div>
        <div
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0"
          role="group"
          aria-label="Familles d’exercices"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              aria-pressed={family === tab.id}
              onClick={() => setFamily(tab.id)}
              className="h-11 shrink-0 rounded-full border border-border bg-surface px-4 text-body-s font-medium text-neutral-130 hover:bg-neutral-20 aria-pressed:border-neutral-150 aria-pressed:bg-neutral-150 aria-pressed:text-white"
            >
              {tab.label}
            </button>
          ))}
        </div>
        {list.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((exercise) => {
              const step = findStep(exercise.id);
              const criterion = step?.progression.steps[step.index].criterion;
              return (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  status={exerciseStatus(exercise.id, progressList, sessions.data ?? [])}
                  target={criterion && formatTarget(criterion, exercise)}
                  step={step && `${step.index + 1}/${step.progression.steps.length}`}
                  to={`/tutoriels/${exercise.id}`}
                />
              );
            })}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-border p-10 text-center text-body-s text-muted">
            Aucun exercice ne correspond{query ? ` à « ${query} »` : ''} dans cette famille.
          </p>
        )}
      </section>
    </PageLayout>
  );
};

export default Tutorials;
