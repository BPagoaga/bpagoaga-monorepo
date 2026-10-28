import { faArrowRight, faCheck, faChevronLeft, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import Button from '../../components/Button';
import ErrorMessage from '../../components/ErrorMessage';
import Icon from '../../components/Icon';
import OnboardingHeader from '../../components/OnboardingHeader';
import Stepper from '../../components/Stepper';
import { getExercise } from '../../content/exercises';
import { LEVEL_TEST } from '../../content/levelTest';
import type { LevelTestResults } from '../../domain/types';
import { useSaveLevelTest } from '../../queries/levelTests';
import { useFetchProfile, useUpdateProfile } from '../../queries/profile';

const DEFAULTS: LevelTestResults = { pull: 5, push: 15, dips: 8, core: 30 };

/** Level test (MOCK-206): a first name (optional), then four max tests. Step 0 is the name. */
const LevelTest = () => {
  const navigate = useNavigate();
  const profile = useFetchProfile();
  const updateProfile = useUpdateProfile();
  const saveLevelTest = useSaveLevelTest();
  const [index, setIndex] = useState(0);
  const [firstName, setFirstName] = useState<string>();
  const [results, setResults] = useState<LevelTestResults>(DEFAULTS);

  const name = firstName ?? profile.data?.firstName ?? '';
  const test = index > 0 ? LEVEL_TEST[index - 1] : undefined;
  const hold = test && getExercise(test.exerciseId)?.measure === 'hold';

  const skip = () =>
    updateProfile.mutate({ onboardedAt: new Date().toISOString() }, { onSuccess: () => navigate('/') });

  const next = (values: LevelTestResults) => {
    if (index < LEVEL_TEST.length) {
      setIndex(index + 1);
      return;
    }
    // Ask the browser to keep the database when storage runs low: it holds the only copy of the user's data.
    void navigator.storage?.persist?.();
    updateProfile.mutate({ firstName: name.trim() || undefined });
    saveLevelTest.mutate(values, { onSuccess: () => navigate('/bienvenue/resultats') });
  };

  return (
    <>
      <OnboardingHeader step={1} steps={3} label="Test de niveau" onSkip={skip} />
      <main className="mx-auto max-w-xl px-4 py-8 pb-32 sm:pb-8">
        <ol className="grid grid-cols-4 gap-2" aria-label="Tests">
          {LEVEL_TEST.map((item, itemIndex) => {
            const done = itemIndex + 1 < index;
            const active = itemIndex + 1 === index;
            return (
              <li key={item.id} className="min-w-0" aria-current={active ? 'step' : undefined}>
                <span
                  className={`block h-1.5 rounded-full ${done ? 'bg-green-100' : active ? 'bg-accent-100' : 'bg-neutral-30'}`}
                  aria-hidden="true"
                />
                <span
                  className={`mt-1.5 flex items-center gap-1 truncate text-body-xs ${active ? 'font-semibold' : 'text-muted'}`}
                >
                  {done && <Icon icon={faCheck} className="size-2.5 text-green-120" />}
                  <span className="truncate">
                    {item.name}
                    {done && ` · ${results[item.id]}`}
                  </span>
                  <span className="sr-only">{done ? ', validé' : active ? ', en cours' : ', à venir'}</span>
                </span>
              </li>
            );
          })}
        </ol>

        {test ? (
          <section className="mt-8" aria-labelledby="test-title">
            <p className="text-body-xs font-semibold uppercase tracking-wide text-accent-130">
              Test {index} sur {LEVEL_TEST.length}
            </p>
            <h1 id="test-title" className="mt-1 font-display text-title-xl">
              {test.name} : ton maximum
            </h1>
            <p className="mt-2 text-body-m text-muted">
              {hold
                ? 'Tiens la position le plus longtemps possible et arrête le chrono dès que la forme se dégrade.'
                : 'Fais autant de répétitions propres que possible, d’une traite. Les répétitions incomplètes ne comptent pas.'}
            </p>
            <ul className="mt-5 space-y-2 rounded-2xl border border-border bg-surface p-4">
              {test.cues.map((cue) => (
                <li key={cue} className="flex gap-2.5 text-body-s">
                  <Icon icon={faCheck} className="mt-1 size-3 text-primary-100" />
                  {cue}
                </li>
              ))}
            </ul>
            <p className="mt-3 flex gap-2 text-body-xs text-muted">
              <Icon icon={faCircleInfo} className="mt-0.5 size-3" />
              Échauffe-toi 5 minutes avant, et repose-toi 3 minutes entre deux tests.
            </p>
            <div className="mt-6">
              <Stepper
                key={test.id}
                id={`test-${test.id}`}
                label={hold ? 'Temps tenu' : 'Répétitions'}
                value={results[test.id]}
                onChange={(value) => setResults({ ...results, [test.id]: value })}
                unit={hold ? 's' : 'reps'}
                step={hold ? 5 : 1}
                size="lg"
              />
            </div>
            <div className="mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted"
                onClick={() => {
                  const values = { ...results, [test.id]: 0 };
                  setResults(values);
                  next(values);
                }}
              >
                {hold ? 'Je ne tiens pas la position' : 'Je n’arrive pas à en faire une'}
              </Button>
            </div>
          </section>
        ) : (
          <section className="mt-8" aria-labelledby="name-title">
            <h1 id="name-title" className="font-display text-title-xl">
              Avant de commencer
            </h1>
            <p className="mt-2 text-body-m text-muted">
              Quatre tests de maximum, cinq minutes en tout. Il te faut une barre de traction et deux supports pour les
              dips.
            </p>
            <label htmlFor="first-name" className="mt-6 block text-body-s font-semibold">
              Ton prénom <span className="font-normal text-muted">(facultatif, pour le tableau de bord)</span>
            </label>
            <input
              id="first-name"
              type="text"
              autoComplete="given-name"
              value={name}
              onChange={(event) => setFirstName(event.target.value)}
              className="mt-1 h-11 w-full rounded-lg border border-border bg-surface px-3 text-body-m focus:border-primary-100 focus:outline-hidden focus:ring-4 focus:ring-primary-20"
            />
          </section>
        )}
        <ErrorMessage error={saveLevelTest.error ?? updateProfile.error} className="mt-4" />

        <div className="fixed inset-x-0 bottom-0 flex gap-2 border-t border-border bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:static sm:mt-8 sm:border-0 sm:bg-transparent sm:p-0">
          {index > 0 && (
            <Button
              variant="ghost"
              size="lg"
              icon={faChevronLeft}
              aria-label="Étape précédente"
              onClick={() => setIndex(index - 1)}
            />
          )}
          <Button
            variant="accent"
            size="lg"
            iconRight={faArrowRight}
            className="flex-1"
            loading={saveLevelTest.isPending}
            onClick={() => next(results)}
          >
            {index === 0
              ? 'Commencer le test'
              : index === LEVEL_TEST.length
                ? 'Voir mes résultats'
                : 'Valider et continuer'}
          </Button>
        </div>
      </main>
    </>
  );
};

export default LevelTest;
