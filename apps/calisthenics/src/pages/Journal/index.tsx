import { faFileExport, faFileImport, faListCheck, faPlay, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useRef } from 'react';
import Button from '../../components/Button';
import CurrentSessionPanel from '../../components/CurrentSessionPanel';
import EmptyState from '../../components/EmptyState';
import ErrorMessage from '../../components/ErrorMessage';
import Loading from '../../components/Loading';
import PageLayout from '../../components/PageLayout';
import SessionCard from '../../components/SessionCard';
import { addDays, startOfWeek } from '../../domain/dates';
import { formatDuration, formatMonth, formatShortDay } from '../../domain/format';
import { personalRecords } from '../../domain/records';
import type { ISession } from '../../domain/types';
import { useNow } from '../../hooks/useNow';
import { useExportData, useImportData } from '../../queries/backup';
import { useFetchLevelTests } from '../../queries/levelTests';
import { useDeleteSession, useFetchSessions } from '../../queries/sessions';

const weekLabel = (monday: Date, now: Date) => {
  const thisWeek = startOfWeek(now).getTime();
  if (monday.getTime() === thisWeek) return 'Cette semaine';
  if (monday.getTime() === addDays(startOfWeek(now), -7).getTime()) return 'Semaine dernière';
  return `Semaine du ${formatShortDay(monday)}`;
};

/** Finished sessions grouped by week (Monday first), newest week first. */
const groupByWeek = (sessions: ISession[], now: Date) => {
  const groups = new Map<number, ISession[]>();
  for (const session of sessions) {
    const monday = startOfWeek(new Date(session.startedAt)).getTime();
    groups.set(monday, [...(groups.get(monday) ?? []), session]);
  }
  return [...groups.entries()].map(([monday, list]) => ({ label: weekLabel(new Date(monday), now), sessions: list }));
};

/** Session log (MOCK-202): history by week; the session in progress sits next to it on large screens. */
const Journal = () => {
  const sessions = useFetchSessions();
  const levelTests = useFetchLevelTests();
  const deleteSession = useDeleteSession();
  const exportData = useExportData();
  const importData = useImportData();
  const fileInput = useRef<HTMLInputElement>(null);
  const now = useNow(60_000);

  if (sessions.isPending || levelTests.isPending) {
    return (
      <PageLayout>
        <Loading />
      </PageLayout>
    );
  }

  const all = sessions.data ?? [];
  const current = all.find((session) => !session.endedAt);
  const finished = all.filter((session) => session.endedAt);
  const records = personalRecords(finished, levelTests.data ?? [], now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonth = finished.filter((session) => new Date(session.startedAt) >= monthStart);
  const monthDuration = thisMonth.reduce(
    (total, session) =>
      total + (new Date(session.endedAt ?? session.startedAt).getTime() - new Date(session.startedAt).getTime()),
    0,
  );

  const onImport = (file: File | undefined) => {
    if (!file) return;
    const confirmed = window.confirm(
      'Importer ce fichier remplace toutes tes données actuelles (séances, modèles, programme, progression). Continuer ?',
    );
    if (confirmed) importData.mutate(file);
  };

  return (
    <PageLayout className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-title-xl">Journal de séances</h1>
          <p className="mt-1 text-body-m text-muted">
            {thisMonth.length} séance{thisMonth.length > 1 ? 's' : ''} en {formatMonth(now)}
            {thisMonth.length > 0 && ` · ${formatDuration(monthDuration)} d’entraînement`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            icon={faFileImport}
            loading={importData.isPending}
            onClick={() => fileInput.current?.click()}
          >
            Importer
          </Button>
          <Button
            variant="ghost"
            icon={faFileExport}
            loading={exportData.isPending}
            onClick={() => exportData.mutate()}
          >
            Exporter
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              onImport(event.target.files?.[0]);
              event.target.value = '';
            }}
          />
        </div>
      </header>
      <ErrorMessage error={exportData.error ?? importData.error ?? deleteSession.error} />
      {importData.isSuccess && (
        <p role="status" className="rounded-lg bg-green-10 px-3 py-2 text-body-s text-green-130">
          Import terminé : tes données ont été remplacées.
        </p>
      )}

      {current && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent-100 bg-accent-10 p-4 xl:hidden">
          <p className="text-body-s">
            <strong className="font-semibold">Séance en cours</strong> · {current.title}
          </p>
          <Button variant="accent" icon={faPlay} to="/seance">
            Reprendre
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="space-y-6" aria-labelledby="history-title">
          <h2 id="history-title" className="sr-only">
            Historique
          </h2>
          {finished.length ? (
            groupByWeek(finished, now).map((group, groupIndex) => (
              <div key={group.label}>
                <h3 className="mb-3 text-body-s font-semibold uppercase tracking-wide text-subtle">{group.label}</h3>
                <div className="space-y-3">
                  {group.sessions.map((session, index) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      records={records}
                      defaultCollapsed={groupIndex > 0 || index > 0}
                      onDelete={() => {
                        if (
                          window.confirm(
                            `Supprimer la séance « ${session.title} » ? Elle disparaîtra du journal et des statistiques.`,
                          )
                        ) {
                          deleteSession.mutate(session.id);
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              icon={faListCheck}
              title="Pas encore de séance"
              text="Chaque séance terminée arrive ici, avec ses séries et ton ressenti."
              action={
                !current && (
                  <Button variant="accent" icon={faPlus} to="/seance/nouvelle">
                    Démarrer une séance
                  </Button>
                )
              }
            />
          )}
        </section>
        {current && (
          <aside className="hidden space-y-3 xl:sticky xl:top-8 xl:block xl:self-start" aria-label="Séance en cours">
            <CurrentSessionPanel session={current} compact />
          </aside>
        )}
      </div>
    </PageLayout>
  );
};

export default Journal;
