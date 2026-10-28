import { faArrowRight, faCheck, faCircleCheck, faLock, faStar } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import ErrorMessage from '../../components/ErrorMessage';
import FamilyBadge from '../../components/FamilyBadge';
import Icon from '../../components/Icon';
import Loading from '../../components/Loading';
import OnboardingHeader from '../../components/OnboardingHeader';
import RadioMark from '../../components/RadioMark';
import { getExercise } from '@bpagoaga/calisthenics-core/content/exercises';
import { getProgression, PROGRESSIONS } from '@bpagoaga/calisthenics-core/content/progressions';
import { isFigureLocked, placements, recommendedFigure } from '@bpagoaga/calisthenics-core/domain/levelTest';
import type { LevelTestResults } from '@bpagoaga/calisthenics-core/domain/types';
import { getFetchProfileQueryKey, useFetchLevelTests, useUpdateProfile } from '@bpagoaga/calisthenics-api-client';
import { useQueryClient } from '@tanstack/react-query';

const PLACED = [
  { progressionId: 'muscle-up', result: (r: LevelTestResults) => `${r.pull} traction${r.pull > 1 ? 's' : ''}` },
  { progressionId: 'hspu', result: (r: LevelTestResults) => `${r.push} pompes · ${r.dips} dips` },
  { progressionId: 'l-sit', result: (r: LevelTestResults) => `${r.core} s de hollow` },
];

/** End of the level test (MOCK-206 v2): starting step per progression, then the goal figure. */
const LevelResults = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const levelTests = useFetchLevelTests();
  const updateProfile = useUpdateProfile();
  const [figure, setFigure] = useState<string>();

  if (levelTests.isPending) return <Loading />;
  const latest = levelTests.data?.[0];
  if (!latest) return <Navigate to="/bienvenue/test" replace />;

  const steps = placements(latest.results);
  const chosen = figure ?? recommendedFigure(latest.results);
  const finish = () =>
    updateProfile.mutate(
      { data: { goalProgressionId: chosen, onboardedAt: new Date().toISOString() } },
      {
        onSuccess: (profile) => {
          queryClient.setQueryData(getFetchProfileQueryKey(), profile);
          void navigate('/programme');
        },
      },
    );

  return (
    <>
      <OnboardingHeader step={2} steps={3} label="Ta figure" onSkip={finish} />
      <main className="mx-auto max-w-3xl space-y-10 px-4 py-8 pb-32 sm:pb-8">
        <section aria-labelledby="results-title">
          <p className="flex items-center gap-1.5 text-body-xs font-semibold uppercase tracking-wide text-green-120">
            <Icon icon={faCircleCheck} className="size-3" /> Test terminé
          </p>
          <h1 id="results-title" className="mt-1 font-display text-title-xl">
            Voilà où tu commences
          </h1>
          <p className="mt-2 text-body-m text-muted">
            Tes résultats deviennent tes premiers records. Chaque progression démarre à l’étape qui te correspond.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            {PLACED.map(({ progressionId, result }) => {
              const progression = getProgression(progressionId);
              if (!progression) return null;
              const step = steps[progressionId] ?? 0;
              return (
                <li key={progressionId} className="rounded-2xl border border-border bg-surface p-4">
                  <FamilyBadge family={progression.family} />
                  <p className="mt-3 font-mono text-body-s font-semibold">{result(latest.results)}</p>
                  <p className="mt-2 text-body-xs text-subtle">Tu commences à</p>
                  <p className="text-body-s font-semibold">{getExercise(progression.steps[step].exerciseId)?.name}</p>
                  <p className="text-body-xs text-muted">
                    Étape {step + 1}/{progression.steps.length}
                  </p>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-body-s text-muted">
            Un résultat te semble faux ?{' '}
            <Link to="/bienvenue/test" className="font-medium text-primary-100 underline hover:text-primary-110">
              Refaire le test
            </Link>
          </p>
        </section>

        <form aria-labelledby="figure-title" onSubmit={(event) => event.preventDefault()}>
          <fieldset>
            <legend id="figure-title" className="text-title-m">
              Choisis ta figure objectif
            </legend>
            <p className="mt-1 text-body-s text-muted">
              Elle guide ta progression en cours et la prochaine étape du tableau de bord. Tu pourras en changer.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {PROGRESSIONS.filter((progression) => progression.figure).map((progression) => {
                const locked = isFigureLocked(progression, latest.results);
                const step = steps[progression.id] ?? 0;
                return (
                  <label
                    key={progression.id}
                    className={`group relative flex gap-3 rounded-2xl border border-border bg-surface p-4 ${locked ? 'opacity-60' : 'cursor-pointer hover:border-neutral-60 has-checked:border-accent-100 has-checked:ring-4 has-checked:ring-accent-20 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary-100'}`}
                  >
                    <input
                      type="radio"
                      name="figure"
                      className="sr-only"
                      checked={chosen === progression.id}
                      disabled={locked}
                      onChange={() => setFigure(progression.id)}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-title-s">{progression.figureName}</span>
                        {progression.id === recommendedFigure(latest.results) && (
                          <Badge label="Recommandée" tone="accent" icon={faStar} size="sm" />
                        )}
                      </span>
                      <span className="mt-0.5 block text-body-s text-muted">{progression.description}</span>
                      <span
                        className={`mt-2 flex items-center gap-1 text-body-xs ${locked ? 'text-subtle' : 'text-green-120'}`}
                      >
                        <Icon icon={locked ? faLock : faCheck} className="size-2.5" />
                        {locked && progression.prerequisite
                          ? `Prérequis : ${progression.prerequisite.label}`
                          : `Départ à l’étape ${step + 1}/${progression.steps.length}`}
                      </span>
                    </span>
                    {!locked && <RadioMark />}
                  </label>
                );
              })}
            </div>
          </fieldset>
        </form>
        <ErrorMessage error={updateProfile.error} />

        <div className="fixed inset-x-0 bottom-0 flex gap-2 border-t border-border bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:static sm:border-0 sm:bg-transparent sm:p-0">
          <Button
            variant="accent"
            size="lg"
            iconRight={faArrowRight}
            className="flex-1 sm:flex-none"
            loading={updateProfile.isPending}
            onClick={finish}
          >
            Planifier ma semaine
          </Button>
        </div>
      </main>
    </>
  );
};

export default LevelResults;
