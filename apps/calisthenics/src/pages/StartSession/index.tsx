import { faPlay, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import Button from '../../components/Button';
import ErrorMessage from '../../components/ErrorMessage';
import ExercisePicker from '../../components/ExercisePicker';
import ExerciseRow from '../../components/ExerciseRow';
import FreeSessionCard from '../../components/FreeSessionCard';
import Loading from '../../components/Loading';
import PageLayout from '../../components/PageLayout';
import SessionTemplateCard from '../../components/SessionTemplateCard';
import { getExercise } from '@bpagoaga/calisthenics-core/content/exercises';
import { findStep } from '@bpagoaga/calisthenics-core/content/progressions';
import { formatLongDay, formatSet, formatShortDay, formatTarget } from '@bpagoaga/calisthenics-core/domain/format';
import {
  estimatedDuration,
  itemLines,
  scheduledDays,
  templateSubtitle,
} from '@bpagoaga/calisthenics-core/domain/templates';
import type { ISession, ISessionTemplate, ITarget, ITemplateItem } from '@bpagoaga/calisthenics-core/domain/types';
import { todayTemplateId } from '@bpagoaga/calisthenics-core/domain/week';
import { useNow } from '../../hooks/useNow';
import {
  getFetchCurrentSessionQueryKey,
  useFetchProgramme,
  useFetchSessions,
  useFetchTemplates,
  useStartSession,
} from '@bpagoaga/calisthenics-api-client';
import { useQueryClient } from '@tanstack/react-query';
import type { Choice, IChoiceOption, InitialChoice, IStartSessionForm } from './types';

const RECENT_COUNT = 4;

const defaultTarget = (exerciseId: string): ITarget => {
  const step = findStep(exerciseId);
  if (step) return step.progression.steps[step.index].criterion;
  return getExercise(exerciseId)?.measure === 'hold' ? { sets: 3, seconds: 20 } : { sets: 3, reps: 8 };
};

/** A past session replayed: its best set of each exercise becomes the target. */
const fromSession = (session: ISession): ITemplateItem[] =>
  session.exercises.map((exercise) => {
    const best = exercise.sets.reduce((max, set) => Math.max(max, set.reps ?? set.seconds ?? 0), 0);
    const hold = getExercise(exercise.exerciseId)?.measure === 'hold';
    return {
      exerciseId: exercise.exerciseId,
      target: { sets: Math.max(1, exercise.sets.length), ...(hold ? { seconds: best } : { reps: best || 'max' }) },
    };
  });

const optionOf = (choice: Choice, templates: ISessionTemplate[], recent: ISession[]): IChoiceOption | undefined => {
  if (choice.kind === 'template') {
    const template = templates.find((t) => t.id === choice.id);
    return template && { title: template.name, templateId: template.id, items: template.items };
  }
  if (choice.kind === 'recent') {
    const session = recent.find((s) => s.id === choice.id);
    return session && { title: session.title, templateId: session.templateId, items: fromSession(session) };
  }
  if (choice.kind === 'free') return { title: 'Séance libre', items: [] };
  return undefined;
};

/** Choosing the session to start (MOCK-204); exercises edited here only change this session, never the template. */
const StartSessionForm = ({ templates, recent, initial, todayId }: IStartSessionForm) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const programme = useFetchProgramme();
  const startSession = useStartSession();
  const now = useNow(60_000);
  const [choice, setChoice] = useState<Choice>(initial);
  const [items, setItems] = useState<ITemplateItem[]>(
    () => initial.items ?? optionOf(initial, templates, recent)?.items ?? [],
  );
  const [picking, setPicking] = useState(initial.kind === 'free' && !initial.items?.length);
  const option = optionOf(choice, templates, recent);

  const choose = (next: Choice) => {
    setChoice(next);
    setItems(optionOf(next, templates, recent)?.items ?? []);
    setPicking(next.kind === 'free');
  };
  const toggle = (exerciseId: string) =>
    setItems(
      items.some((item) => item.exerciseId === exerciseId)
        ? items.filter((item) => item.exerciseId !== exerciseId)
        : [...items, { exerciseId, target: defaultTarget(exerciseId) }],
    );
  const isChecked = (kind: Choice['kind'], id?: string) =>
    choice.kind === kind && (!id || ('id' in choice && choice.id === id));
  const templateCard = (template: ISessionTemplate, badge?: string) => (
    <SessionTemplateCard
      key={template.id}
      title={template.name}
      subtitle={templateSubtitle(template.items, scheduledDays(template.id, programme.data))}
      lines={itemLines(template.items)}
      badge={badge}
      radio={{
        name: 'start',
        checked: isChecked('template', template.id),
        onChange: () => choose({ kind: 'template', id: template.id }),
      }}
    />
  );
  const today = templates.find((template) => template.id === todayId);
  const others = templates.filter((template) => template.id !== todayId);

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
      <form className="space-y-8" aria-label="Choix de la séance" onSubmit={(event) => event.preventDefault()}>
        {today && (
          <fieldset className="space-y-3">
            <legend className="text-title-m">Prévue aujourd’hui</legend>
            {templateCard(today, `Programme · ${formatLongDay(now)}`)}
          </fieldset>
        )}
        {others.length > 0 && (
          <fieldset className="space-y-3">
            <legend className="text-title-m">{today ? 'Un autre modèle' : 'Un modèle'}</legend>
            <div className="grid gap-3 md:grid-cols-2">{others.map((template) => templateCard(template))}</div>
          </fieldset>
        )}
        {recent.length > 0 && (
          <fieldset className="space-y-3">
            <legend className="text-title-m">Refaire une séance récente</legend>
            <div className="grid gap-3 md:grid-cols-2">
              {recent.map((session) => (
                <SessionTemplateCard
                  key={session.id}
                  title={session.title}
                  subtitle={`${session.exercises.length} exercice${session.exercises.length > 1 ? 's' : ''}`}
                  lines={session.exercises.map((exercise) => ({
                    name: getExercise(exercise.exerciseId)?.name ?? exercise.exerciseId,
                    detail: exercise.sets.map(formatSet).join(' · ') || '—',
                  }))}
                  footnote={formatShortDay(new Date(session.startedAt))}
                  radio={{
                    name: 'start',
                    checked: isChecked('recent', session.id),
                    onChange: () => choose({ kind: 'recent', id: session.id }),
                  }}
                />
              ))}
            </div>
          </fieldset>
        )}
        <fieldset className="space-y-3">
          <legend className="text-title-m">Séance libre</legend>
          <FreeSessionCard name="start" checked={isChecked('free')} onChange={() => choose({ kind: 'free' })} />
        </fieldset>
      </form>

      <aside className="space-y-4 xl:sticky xl:top-8 xl:self-start" aria-labelledby="summary-title">
        <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
          <h2 id="summary-title" className="text-title-s">
            Ta séance {option && <span className="font-normal text-muted">· {option.title}</span>}
          </h2>
          {option ? (
            <>
              <p className="mt-0.5 text-body-xs text-muted">
                {items.length} exercice{items.length > 1 ? 's' : ''} · environ {estimatedDuration(items)} · modifiable
                sans toucher au modèle
              </p>
              {items.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {items.map((item) => {
                    const exercise = getExercise(item.exerciseId);
                    return (
                      exercise && (
                        <ExerciseRow
                          key={item.exerciseId}
                          name={exercise.name}
                          family={exercise.family}
                          detail={formatTarget(item.target, exercise)}
                          onRemove={() => setItems(items.filter((other) => other.exerciseId !== item.exerciseId))}
                        />
                      )
                    );
                  })}
                </ul>
              )}
              <div className="mt-3">
                {picking ? (
                  <div className="space-y-3">
                    <ExercisePicker
                      idPrefix="start"
                      selected={items.map((item) => item.exerciseId)}
                      onToggle={toggle}
                    />
                    <Button variant="ghost" icon={faXmark} onClick={() => setPicking(false)} className="w-full">
                      Fermer la bibliothèque
                    </Button>
                  </div>
                ) : (
                  <Button variant="ghost" icon={faPlus} onClick={() => setPicking(true)} className="w-full">
                    Ajouter un exercice
                  </Button>
                )}
              </div>
            </>
          ) : (
            <p className="mt-1 text-body-s text-muted">
              Pas de séance prévue aujourd’hui : choisis un modèle, une séance récente ou pars de zéro.
            </p>
          )}
        </div>
        <ErrorMessage error={startSession.error} />
        <div className="sticky bottom-24 xl:static">
          <Button
            variant="accent"
            size="lg"
            icon={faPlay}
            className="w-full shadow-elevation-2 xl:shadow-none"
            disabled={!option || items.length === 0}
            loading={startSession.isPending}
            onClick={() =>
              option &&
              startSession.mutate(
                {
                  data: {
                    title: option.title,
                    templateId: option.templateId,
                    exercises: items.map((item) => ({ exerciseId: item.exerciseId, target: item.target })),
                  },
                },
                {
                  // The session page reads the current session: show it at once rather than the cached "none".
                  onSuccess: (session) => {
                    queryClient.setQueryData(getFetchCurrentSessionQueryKey(), session);
                    void navigate('/seance');
                  },
                },
              )
            }
          >
            Démarrer la séance
          </Button>
        </div>
      </aside>
    </div>
  );
};

/** Start a session: today's planned template is preselected; `?exercice=` preselects a free session with it. */
const StartSession = () => {
  const [params] = useSearchParams();
  const sessions = useFetchSessions();
  const templates = useFetchTemplates();
  const programme = useFetchProgramme();
  const now = useNow(60_000);

  if (sessions.isPending || templates.isPending || programme.isPending) {
    return (
      <PageLayout>
        <Loading />
      </PageLayout>
    );
  }
  const all = sessions.data ?? [];
  if (all.some((session) => !session.endedAt)) return <Navigate to="/seance" replace />;

  const recent = all.filter((session) => session.endedAt).slice(0, RECENT_COUNT);
  const exerciseId = params.get('exercice');
  const todayId = todayTemplateId(programme.data, all, now);
  const initial: InitialChoice =
    exerciseId && getExercise(exerciseId)
      ? { kind: 'free', items: [{ exerciseId, target: defaultTarget(exerciseId) }] }
      : todayId
        ? { kind: 'template', id: todayId }
        : { kind: 'none' };

  return (
    <PageLayout>
      <header>
        <p className="text-body-s text-muted">{formatLongDay(now)}</p>
        <h1 className="font-display text-title-xl">Nouvelle séance</h1>
      </header>
      <StartSessionForm templates={templates.data ?? []} recent={recent} initial={initial} todayId={todayId} />
    </PageLayout>
  );
};

export default StartSession;
