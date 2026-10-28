import {
  faArrowLeft,
  faArrowRight,
  faCalendarPlus,
  faCheck,
  faChevronRight,
  faCircleInfo,
  faLock,
  faPlay,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { Link, useParams } from 'react-router';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { EXERCISE_STATUSES } from '../../components/ExerciseCard/statuses';
import ErrorMessage from '../../components/ErrorMessage';
import FamilyBadge from '../../components/FamilyBadge';
import { FAMILIES } from '../../components/FamilyBadge/families';
import Icon from '../../components/Icon';
import LevelDots from '../../components/LevelDots';
import Loading from '../../components/Loading';
import PageLayout from '../../components/PageLayout';
import ProgressionPath from '../../components/ProgressionPath';
import { getExercise } from '../../content/exercises';
import { findStep } from '../../content/progressions';
import { formatSet, formatShortDay, formatTarget } from '../../domain/format';
import { currentStepOf, exerciseStatus, stepStatus } from '../../domain/progress';
import { meetsCriterion, setMeetsTarget } from '../../domain/sets';
import { useFetchProgress, useSetProgressStep } from '../../queries/progress';
import { useFetchSessions } from '../../queries/sessions';
import { useAddItemToTemplate, useFetchTemplates } from '../../queries/templates';

const ATTEMPTS = 3;

/** Exercise page (MOCK-205): how to do it first, then where I stand (criterion, attempts, path). */
const ExerciseDetail = () => {
  const { exerciseId = '' } = useParams();
  const exercise = getExercise(exerciseId);
  const progress = useFetchProgress();
  const sessions = useFetchSessions();
  const templates = useFetchTemplates();
  const addToTemplate = useAddItemToTemplate();
  const setStep = useSetProgressStep();
  const [choosingTemplate, setChoosingTemplate] = useState(false);
  const [addedTo, setAddedTo] = useState<string>();

  if (!exercise) {
    return (
      <PageLayout>
        <p className="text-body-m">
          Cet exercice n’existe pas.{' '}
          <Link to="/tutoriels" className="font-medium text-primary-100 underline">
            Retour aux tutoriels
          </Link>
        </p>
      </PageLayout>
    );
  }
  if (progress.isPending || sessions.isPending || templates.isPending) {
    return (
      <PageLayout>
        <Loading />
      </PageLayout>
    );
  }

  const progressList = progress.data ?? [];
  const step = findStep(exercise.id);
  const criterion = step?.progression.steps[step.index].criterion;
  const current = step ? currentStepOf(step.progression.id, progressList) : 0;
  const status = exerciseStatus(exercise.id, progressList, sessions.data ?? []);
  const statusMeta = EXERCISE_STATUSES[status];
  const previous = step && step.index > 0 ? getExercise(step.progression.steps[step.index - 1].exerciseId) : undefined;
  const next =
    step && step.index < step.progression.steps.length - 1
      ? getExercise(step.progression.steps[step.index + 1].exerciseId)
      : undefined;
  const attempts = (sessions.data ?? [])
    .filter((session) => session.endedAt)
    .flatMap((session) =>
      session.exercises
        .filter((entry) => entry.exerciseId === exercise.id && entry.sets.length)
        .map((entry) => ({
          date: session.startedAt,
          sets: entry.sets,
          met: criterion ? meetsCriterion(entry, criterion) : false,
        })),
    )
    .slice(0, ATTEMPTS);
  const bestCount = criterion
    ? Math.max(0, ...attempts.map((attempt) => attempt.sets.filter((set) => setMeetsTarget(set, criterion)).length))
    : 0;
  const isCurrentStep = !!step && step.index === current;

  return (
    <PageLayout className="">
      <nav aria-label="Fil d’Ariane">
        <ol className="flex flex-wrap items-center gap-1.5 text-body-s text-muted">
          <li>
            <Link to="/tutoriels" className="hover:text-foreground hover:underline">
              Tutoriels
            </Link>
          </li>
          <li aria-hidden="true">
            <Icon icon={faChevronRight} className="size-2.5" />
          </li>
          {step ? (
            <>
              <li>{step.progression.name}</li>
              <li aria-hidden="true">
                <Icon icon={faChevronRight} className="size-2.5" />
              </li>
              <li aria-current="page" className="font-medium text-foreground">
                Étape {step.index + 1}
              </li>
            </>
          ) : (
            <li aria-current="page" className="font-medium text-foreground">
              {exercise.name}
            </li>
          )}
        </ol>
      </nav>

      <header className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="flex flex-wrap gap-2">
            <FamilyBadge family={exercise.family} size="md" />
            <Badge label={statusMeta.label} tone={statusMeta.tone} icon={statusMeta.icon} />
            {step && <Badge label={`Étape ${step.index + 1}/${step.progression.steps.length}`} />}
          </div>
          <h1 className="mt-3 font-display text-title-xl md:text-display">{exercise.name}</h1>
          <p className="mt-2 text-body-l text-muted">{exercise.summary}</p>
          <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-body-s">
            <div className="flex items-center gap-2">
              <dt className="text-subtle">Niveau</dt>
              <dd>
                <LevelDots level={exercise.level} />
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-subtle">Matériel</dt>
              <dd className="font-medium">{exercise.equipment}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-subtle">Muscles</dt>
              <dd className="font-medium">{exercise.muscles.join(', ')}</dd>
            </div>
          </dl>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="lg"
            icon={faCalendarPlus}
            aria-expanded={choosingTemplate}
            onClick={() => setChoosingTemplate(!choosingTemplate)}
          >
            Ajouter à un modèle
          </Button>
          <Button variant="accent" size="lg" icon={faPlay} to={`/seance/nouvelle?exercice=${exercise.id}`}>
            S’entraîner maintenant
          </Button>
        </div>
      </header>

      {choosingTemplate && (
        <section className="mt-4 rounded-2xl border border-border bg-surface p-4" aria-label="Ajouter à un modèle">
          <p className="text-body-s font-semibold">Ajouter {exercise.name} au modèle :</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {(templates.data ?? []).map((template) => {
              const already = template.items.some((item) => item.exerciseId === exercise.id) || addedTo === template.id;
              return (
                <li key={template.id}>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={already ? faCheck : undefined}
                    disabled={already}
                    loading={addToTemplate.isPending && addToTemplate.variables?.id === template.id}
                    onClick={() =>
                      addToTemplate.mutate(
                        {
                          id: template.id,
                          item: {
                            exerciseId: exercise.id,
                            target:
                              criterion ??
                              (exercise.measure === 'hold' ? { sets: 3, seconds: 20 } : { sets: 3, reps: 8 }),
                          },
                        },
                        { onSuccess: () => setAddedTo(template.id) },
                      )
                    }
                  >
                    {template.name}
                  </Button>
                </li>
              );
            })}
          </ul>
          {addedTo && (
            <p role="status" className="mt-2 text-body-xs text-green-120">
              Ajouté. Retrouve-le dans le programme.
            </p>
          )}
          <ErrorMessage error={addToTemplate.error} className="mt-2" />
        </section>
      )}

      {status === 'locked' && previous && (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-neutral-20 px-4 py-3 text-body-s">
          <Icon icon={faLock} className="mt-1 size-3" />
          Étape verrouillée : valide d’abord « {previous.name} ». Tu peux déjà lire la fiche pour t’y préparer.
        </p>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-8">
          {exercise.video ? (
            <a
              href={exercise.video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative grid aspect-video place-items-center overflow-hidden rounded-2xl bg-neutral-150 text-white"
            >
              <span
                className="grid size-16 place-items-center rounded-full bg-accent-100 text-neutral-150 transition group-hover:scale-105"
                aria-hidden="true"
              >
                <Icon icon={faPlay} className="size-6" />
              </span>
              <span className="absolute bottom-4 left-4 text-body-s font-medium">
                {exercise.video.label} <span className="sr-only">(s’ouvre dans un nouvel onglet)</span>
              </span>
            </a>
          ) : (
            <div className="grid aspect-video place-items-center rounded-2xl bg-neutral-150 text-center text-white">
              <div>
                <Icon icon={FAMILIES[exercise.family].icon} className="mx-auto size-10 text-accent-100" />
                <p className="mt-3 text-body-s text-neutral-40">Démonstration vidéo à venir</p>
              </div>
            </div>
          )}

          <section aria-labelledby="cues-title">
            <h2 id="cues-title" className="text-title-m">
              Exécution
            </h2>
            <ol className="mt-4 space-y-3">
              {exercise.cues.map((cue, index) => (
                <li key={cue} className="flex gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary-10 text-body-xs font-bold text-primary-120">
                    {index + 1}
                  </span>
                  <p className="pt-0.5 text-body-m">{cue}</p>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="mistakes-title">
            <h2 id="mistakes-title" className="text-title-m">
              Erreurs fréquentes
            </h2>
            <ul className="mt-4 grid gap-3 md:grid-cols-3">
              {exercise.mistakes.map((mistake) => (
                <li key={mistake.title} className="rounded-2xl border border-border bg-surface p-4">
                  <p className="flex items-center gap-2 text-body-s font-semibold">
                    <Icon icon={faTriangleExclamation} className="size-3.5 text-orange-110" />
                    {mistake.title}
                  </p>
                  <p className="mt-1 text-body-s text-muted">{mistake.text}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-8 xl:self-start">
          {step && criterion && (
            <section className="rounded-2xl border border-border bg-surface p-5" aria-labelledby="criterion-title">
              <p className="text-body-xs font-semibold uppercase tracking-wide text-accent-130">
                Pour passer à l’étape suivante
              </p>
              <h2 id="criterion-title" className="mt-1 text-title-s">
                {formatTarget(criterion, exercise)}
              </h2>
              <p className="mt-1 text-body-s text-muted">
                {status === 'mastered'
                  ? 'Étape validée.'
                  : attempts.length
                    ? `Meilleure tentative : ${bestCount} série${bestCount > 1 ? 's' : ''} sur ${criterion.sets} au niveau.`
                    : 'Pas encore de tentative enregistrée.'}
              </p>
              {attempts.length > 0 && (
                <>
                  <h3 className="mt-4 text-body-xs font-semibold uppercase tracking-wide text-subtle">
                    Dernières tentatives
                  </h3>
                  <ul className="mt-2 divide-y divide-border">
                    {attempts.map((attempt) => (
                      <li key={attempt.date} className="flex items-center justify-between gap-3 py-2">
                        <span className={`text-body-s ${attempt.met ? 'font-semibold' : 'text-muted'}`}>
                          {formatShortDay(new Date(attempt.date))}
                        </span>
                        <span className="flex flex-wrap justify-end gap-1">
                          {attempt.sets.map((set) => {
                            const ok = setMeetsTarget(set, criterion);
                            return (
                              <span
                                key={set.doneAt}
                                className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-body-xs ${ok ? 'bg-green-10 text-green-130' : 'bg-neutral-20 text-neutral-130'}`}
                              >
                                {ok && <Icon icon={faCheck} className="size-2.5" />}
                                {formatSet(set)}
                                {ok && <span className="sr-only"> (au niveau)</span>}
                              </span>
                            );
                          })}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {isCurrentStep && (
                <div className="mt-4 border-t border-border pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Valider l’étape « ${exercise.name} » sans tentative enregistrée ?`)) {
                        setStep.mutate({ progressionId: step.progression.id, step: step.index + 1, source: 'manual' });
                      }
                    }}
                    className="inline-flex min-h-11 items-center gap-2 text-body-s font-medium text-primary-100 hover:underline"
                  >
                    <Icon icon={faCircleInfo} className="size-3" />
                    Je maîtrise déjà cette étape
                  </button>
                  <ErrorMessage error={setStep.error} />
                </div>
              )}
            </section>
          )}

          {step && (
            <section className="rounded-2xl border border-border bg-surface p-5" aria-labelledby="path-title">
              <h2 id="path-title" className="text-title-s">
                {step.progression.name}
              </h2>
              <div className="mt-4">
                <ProgressionPath
                  title={step.progression.name}
                  steps={step.progression.steps.map((pathStep, index) => {
                    const pathExercise = getExercise(pathStep.exerciseId);
                    return {
                      name: pathExercise?.name ?? pathStep.exerciseId,
                      criterion: formatTarget(pathStep.criterion, pathExercise),
                      status: stepStatus(index, current),
                      to: pathStep.exerciseId === exercise.id ? undefined : `/tutoriels/${pathStep.exerciseId}`,
                    };
                  })}
                />
              </div>
              <div className="grid gap-2 border-t border-border pt-4 sm:grid-cols-2 xl:grid-cols-1">
                {previous && (
                  <Link
                    to={`/tutoriels/${previous.id}`}
                    className="rounded-xl border border-border p-3 hover:border-primary-60"
                  >
                    <span className="flex items-center gap-1 text-body-xs text-subtle">
                      <Icon icon={faArrowLeft} className="size-2.5" /> Étape précédente
                    </span>
                    <span className="block text-body-s font-semibold">{previous.name}</span>
                  </Link>
                )}
                {next && (
                  <Link
                    to={`/tutoriels/${next.id}`}
                    className="rounded-xl border border-border p-3 hover:border-primary-60"
                  >
                    <span className="flex items-center gap-1 text-body-xs text-subtle">
                      Étape suivante
                      <Icon icon={step.index + 1 > current ? faLock : faArrowRight} className="size-2.5" />
                      {step.index + 1 > current && <span className="sr-only">(verrouillée)</span>}
                    </span>
                    <span className="block text-body-s font-semibold">{next.name}</span>
                  </Link>
                )}
              </div>
            </section>
          )}
        </aside>
      </div>
    </PageLayout>
  );
};

export default ExerciseDetail;
