import {
  faArrowRight,
  faBullseye,
  faCalendarCheck,
  faHand,
  faArrowsDownToLine,
  faPlay,
  faStopwatch,
  faTrophy,
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import Loading from '../../components/Loading';
import PageLayout from '../../components/PageLayout';
import ProgressChart from '../../components/ProgressChart';
import SessionCard from '../../components/SessionCard';
import StatCard, { type IStatCard } from '../../components/StatCard';
import WeekPlanner from '../../components/WeekPlanner';
import { getExercise } from '@bpagoaga/calisthenics-core/content/exercises';
import { getProgression, PROGRESSIONS } from '@bpagoaga/calisthenics-core/content/progressions';
import {
  formatLongDay,
  formatMonth,
  formatRecord,
  formatSet,
  formatShortDay,
  formatTarget,
} from '@bpagoaga/calisthenics-core/domain/format';
import { currentStepOf, progressionPercent } from '@bpagoaga/calisthenics-core/domain/progress';
import { bestBetween, monthlyBest, personalRecords, weeklyVolume } from '@bpagoaga/calisthenics-core/domain/records';
import type { ILevelTestResult, ISession } from '@bpagoaga/calisthenics-core/domain/types';
import { streakDays, todayTemplateId, weekDays } from '@bpagoaga/calisthenics-core/domain/week';
import { useNow } from '../../hooks/useNow';
import {
  useFetchLevelTests,
  useFetchProfile,
  useFetchProgramme,
  useFetchProgress,
  useFetchSessions,
  useFetchTemplates,
} from '@bpagoaga/calisthenics-api-client';
import Welcome from './Welcome';

const monthStat = (
  label: string,
  exerciseId: string,
  icon: IStatCard['icon'],
  sessions: ISession[],
  levelTests: ILevelTestResult[],
  now: Date,
): IStatCard => {
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const current = bestBetween(sessions, levelTests, exerciseId, thisMonth, nextMonth);
  const previous = bestBetween(sessions, levelTests, exerciseId, lastMonth, thisMonth);
  const hold = getExercise(exerciseId)?.measure === 'hold';
  const value = (hold ? current?.seconds : current?.reps) ?? 0;
  const before = (hold ? previous?.seconds : previous?.reps) ?? 0;
  const diff = value - before;
  return {
    label,
    icon,
    value: value ? String(value) : '—',
    unit: hold ? 's' : 'reps',
    ...(value && before
      ? {
          delta: `${diff > 0 ? '+' : ''}${diff}${hold ? ' s' : ''}`,
          trend: diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat',
          caption: 'vs. mois dernier',
        }
      : { caption: value ? 'ce mois-ci' : undefined }),
  };
};

/** Dashboard (MOCK-200): what to do now, where I stand, then the detail. */
const Dashboard = () => {
  const profile = useFetchProfile();
  const sessions = useFetchSessions();
  const programme = useFetchProgramme();
  const templates = useFetchTemplates();
  const progress = useFetchProgress();
  const levelTests = useFetchLevelTests();
  const now = useNow(60_000);

  if (
    profile.isPending ||
    sessions.isPending ||
    programme.isPending ||
    templates.isPending ||
    progress.isPending ||
    levelTests.isPending
  ) {
    return (
      <PageLayout>
        <Loading />
      </PageLayout>
    );
  }
  const allSessions = sessions.data ?? [];
  if (!profile.data?.onboardedAt && !allSessions.length) return <Welcome />;

  const finished = allSessions.filter((session) => session.endedAt);
  const current = allSessions.find((session) => !session.endedAt);
  const tests = levelTests.data ?? [];
  const progressList = progress.data ?? [];
  const templateList = templates.data ?? [];
  const todayId = todayTemplateId(programme.data, allSessions, now);
  const todayName = templateList.find((template) => template.id === todayId)?.name;
  const doneToday = finished.some((session) => new Date(session.startedAt).toDateString() === now.toDateString());
  const streak = streakDays(programme.data, allSessions, now);
  const week = weekDays(programme.data, allSessions, now);
  const planned = week.filter((day) => day.templateId).length;
  const doneThisWeek = week.filter((day) => day.status === 'done').length;

  const goal = getProgression(profile.data?.goalProgressionId ?? 'muscle-up') ?? PROGRESSIONS[0];
  const goalStep = currentStepOf(goal.id, progressList);
  const nextStep = goal.steps[goalStep];
  const nextExercise = nextStep && getExercise(nextStep.exerciseId);
  const lastAttempt = nextStep
    ? finished.flatMap((session) => session.exercises).find((exercise) => exercise.exerciseId === nextStep.exerciseId)
    : undefined;

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const inRange = (session: ISession, from: Date, to?: Date) =>
    new Date(session.startedAt) >= from && (!to || new Date(session.startedAt) < to);
  const sessionsThisMonth = finished.filter((session) => inRange(session, monthStart)).length;
  const sessionsLastMonth = finished.filter((session) => inRange(session, lastMonthStart, monthStart)).length;
  const sessionDiff = sessionsThisMonth - sessionsLastMonth;
  const stats: IStatCard[] = [
    monthStat('Tractions max', 'traction-stricte', faArrowsDownToLine, finished, tests, now),
    monthStat('Pompes max', 'pompe', faHand, finished, tests, now),
    monthStat('L-sit', 'l-sit', faStopwatch, finished, tests, now),
    {
      label: 'Séances',
      value: String(sessionsThisMonth),
      unit: `en ${formatMonth(now)}`,
      icon: faCalendarCheck,
      delta: `${sessionDiff > 0 ? '+' : ''}${sessionDiff}`,
      trend: sessionDiff > 0 ? 'up' : sessionDiff < 0 ? 'down' : 'flat',
      caption: planned ? `objectif : ${planned * 4}` : 'vs. mois dernier',
    },
  ];
  const records = personalRecords(finished, tests, now);

  return (
    <PageLayout>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-body-s text-muted">{formatLongDay(now)}</p>
          <h1 className="font-display text-title-xl">
            Salut{profile.data?.firstName ? ` ${profile.data.firstName}` : ''} 👋
          </h1>
          <p className="mt-1 text-body-m text-muted">
            {current ? (
              <>
                En cours : <strong className="font-semibold text-foreground">{current.title}</strong>
              </>
            ) : todayName ? (
              <>
                Séance <strong className="font-semibold text-foreground">{todayName}</strong> prévue aujourd’hui
              </>
            ) : doneToday ? (
              'Séance du jour faite, bravo'
            ) : (
              'Pas de séance prévue aujourd’hui'
            )}
            {streak > 0 && ` · ${streak} jour${streak > 1 ? 's' : ''} de régularité`}.
          </p>
        </div>
        <Button variant="accent" size="lg" icon={faPlay} to={current ? '/seance' : '/seance/nouvelle'}>
          {current ? 'Reprendre la séance' : 'Démarrer la séance'}
        </Button>
      </header>

      <section
        className="flex flex-col gap-4 rounded-2xl bg-neutral-150 p-5 text-white sm:flex-row sm:items-center md:p-6"
        aria-label="Objectif en cours"
      >
        <div
          className="grid size-14 shrink-0 place-items-center rounded-2xl bg-accent-100 text-neutral-150"
          aria-hidden="true"
        >
          <Icon icon={faBullseye} className="size-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-body-xs font-semibold uppercase tracking-wide text-accent-80">
            {nextStep ? `Prochaine étape · ${goal.figureName}` : goal.name}
          </p>
          <p className="mt-1 text-title-s">
            {nextStep && nextExercise
              ? `${nextExercise.name} : ${formatTarget(nextStep.criterion, nextExercise)}`
              : 'Figure maîtrisée 🎉'}
          </p>
          <p className="mt-1 text-body-s text-neutral-40">
            {lastAttempt?.sets.length
              ? `Dernière tentative : ${lastAttempt.sets.map(formatSet).join(', ')}`
              : nextStep
                ? 'Pas encore de tentative : lis la fiche, puis ajoute l’exercice à ta prochaine séance.'
                : 'Choisis une autre figure dans les tutoriels.'}
          </p>
        </div>
        {nextExercise && (
          <Button variant="secondary" iconRight={faArrowRight} to={`/tutoriels/${nextExercise.id}`}>
            Voir le tutoriel
          </Button>
        )}
      </section>

      <section className="space-y-3" aria-labelledby="week-title">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="week-title" className="text-title-m">
            Cette semaine{' '}
            <span className="text-body-m font-normal text-muted">
              · {doneThisWeek} séance{doneThisWeek > 1 ? 's' : ''}
              {planned ? ` sur ${planned}` : ''}
            </span>
          </h2>
          <Link to="/programme" className="text-body-s font-medium text-primary-100 hover:underline">
            {planned ? 'Modifier le programme' : 'Planifier ma semaine'}
          </Link>
        </div>
        <WeekPlanner days={week} templates={templateList} />
      </section>

      <section aria-label="Indicateurs du mois" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-1">
          <ProgressChart
            title="Volume hebdomadaire"
            subtitle="répétitions totales · 8 semaines"
            points={weeklyVolume(finished, now)}
          />
          <ProgressChart
            title="Tractions max"
            subtitle="meilleure série · 6 mois"
            points={monthlyBest(finished, tests, 'traction-stricte', now)}
          />
        </div>
        <section className="rounded-2xl border border-border bg-surface p-5" aria-labelledby="records-title">
          <h2 id="records-title" className="text-title-s">
            Records personnels
          </h2>
          {records.length ? (
            <ul className="mt-3 divide-y divide-border">
              {records.slice(0, 6).map((record) => (
                <li key={record.exerciseId} className="flex items-center gap-3 py-3">
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-lg ${record.isNew ? 'bg-accent-10 text-accent-130' : 'bg-neutral-20 text-neutral-110'}`}
                    aria-hidden="true"
                  >
                    <Icon icon={faTrophy} className="size-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body-s font-semibold">
                      {getExercise(record.exerciseId)?.name}
                      {record.isNew && (
                        <span className="ml-1 rounded-full bg-accent-10 px-1.5 py-0.5 text-body-xs font-semibold text-accent-140">
                          Nouveau
                        </span>
                      )}
                    </p>
                    <p className="text-body-xs text-muted">{formatShortDay(new Date(record.date))}</p>
                  </div>
                  <p className="font-mono text-body-s font-semibold">{formatRecord(record.set)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-body-s text-muted">Tes records apparaîtront après ta première séance.</p>
          )}
        </section>
      </div>

      <section className="space-y-4" aria-labelledby="goals-title">
        <h2 id="goals-title" className="text-title-m">
          Objectifs figures
        </h2>
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {PROGRESSIONS.filter((progression) => progression.figure).map((progression) => {
            const percent = progressionPercent(progression, progressList);
            const step = currentStepOf(progression.id, progressList);
            const stepExercise = progression.steps[step] && getExercise(progression.steps[step].exerciseId);
            const isGoal = progression.id === goal.id;
            return (
              <li
                key={progression.id}
                className={`rounded-2xl border bg-surface p-5 ${isGoal ? 'border-accent-100' : 'border-border'}`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-title-s">
                    {progression.figureName}
                    {isGoal && <span className="sr-only"> (ton objectif)</span>}
                  </p>
                  <p className="font-mono text-body-s font-semibold">{percent} %</p>
                </div>
                <div
                  className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-20"
                  role="progressbar"
                  aria-valuenow={percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Progression ${progression.name}`}
                >
                  <div className="h-full rounded-full bg-accent-100" style={{ width: `${percent}%` }} />
                </div>
                <p className="mt-2 text-body-xs text-muted">
                  {stepExercise ? `Étape ${step + 1}/${progression.steps.length} · ${stepExercise.name}` : 'Maîtrisée'}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-4" aria-labelledby="last-title">
        <div className="flex items-baseline justify-between">
          <h2 id="last-title" className="text-title-m">
            Dernière séance
          </h2>
          <Link to="/journal" className="text-body-s font-medium text-primary-100 hover:underline">
            Tout le journal
          </Link>
        </div>
        {finished[0] ? (
          <SessionCard session={finished[0]} records={records} />
        ) : (
          <p className="text-body-s text-muted">Aucune séance terminée pour l’instant.</p>
        )}
      </section>
    </PageLayout>
  );
};

export default Dashboard;
