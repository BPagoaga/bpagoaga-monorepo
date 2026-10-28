import { faCalendarWeek, faPlus } from '@fortawesome/free-solid-svg-icons';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import ErrorMessage from '../../components/ErrorMessage';
import Loading from '../../components/Loading';
import PageLayout from '../../components/PageLayout';
import SessionTemplateCard from '../../components/SessionTemplateCard';
import WeekPlanner from '../../components/WeekPlanner';
import {
  dominantFamily,
  itemLines,
  scheduledDays,
  templateSubtitle,
} from '@bpagoaga/calisthenics-core/domain/templates';
import { weekDays } from '@bpagoaga/calisthenics-core/domain/week';
import { useNow } from '../../hooks/useNow';
import {
  useDuplicateTemplate,
  useFetchProgramme,
  useFetchSessions,
  useFetchTemplates,
  useSetProgrammeDay,
} from '@bpagoaga/calisthenics-api-client';

const NEW_TEMPLATE = '/programme/modeles/nouveau';

/** Programme (MOCK-203): a template or rest per weekday, the same week repeating; changes save immediately. */
const Programme = () => {
  const programme = useFetchProgramme();
  const templates = useFetchTemplates();
  const sessions = useFetchSessions();
  const setDay = useSetProgrammeDay();
  const duplicate = useDuplicateTemplate();
  const now = useNow(60_000);

  if (programme.isPending || templates.isPending || sessions.isPending) {
    return (
      <PageLayout>
        <Loading />
      </PageLayout>
    );
  }
  const list = templates.data ?? [];
  const planned = programme.data?.days.filter(Boolean).length ?? 0;

  return (
    <PageLayout className="space-y-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-title-xl">Programme</h1>
          <p className="mt-1 text-body-m text-muted">
            {planned
              ? `${planned} séance${planned > 1 ? 's' : ''} par semaine · la même semaine se répète jusqu’à ce que tu la changes.`
              : 'Choisis les jours où tu t’entraînes : la même semaine se répétera.'}
          </p>
        </div>
        <Button icon={faPlus} to={NEW_TEMPLATE}>
          Créer un modèle
        </Button>
      </header>

      <section className="space-y-3" aria-labelledby="week-title">
        <div>
          <h2 id="week-title" className="text-title-m">
            Ta semaine
          </h2>
          <p className="text-body-s text-muted">
            Choisis un modèle pour chaque jour d’entraînement. Les modifications sont enregistrées tout de suite.
          </p>
        </div>
        <WeekPlanner
          days={weekDays(programme.data, sessions.data ?? [], now)}
          templates={list}
          onChange={(dayIndex, templateId) => setDay.mutate({ dayIndex, data: { templateId } })}
        />
        <ErrorMessage error={setDay.error} />
        {setDay.isSuccess && (
          <p role="status" className="text-body-xs text-green-120">
            Semaine enregistrée.
          </p>
        )}
      </section>

      <section className="space-y-3" aria-labelledby="templates-title">
        <h2 id="templates-title" className="text-title-m">
          Modèles de séance <span className="text-body-m font-normal text-muted">· {list.length}</span>
        </h2>
        <ErrorMessage error={duplicate.error} />
        {list.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {list.map((template) => (
              <SessionTemplateCard
                key={template.id}
                title={template.name}
                subtitle={templateSubtitle(template.items, scheduledDays(template.id, programme.data))}
                lines={itemLines(template.items)}
                family={dominantFamily(template.items)}
                editTo={`/programme/modeles/${template.id}`}
                onDuplicate={() => duplicate.mutate({ templateId: template.id })}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={faCalendarWeek}
            title="Pas encore de modèle de séance"
            text="Un modèle, c’est une liste d’exercices avec leurs objectifs. Crée-en un, puis assigne-le aux jours où tu t’entraînes."
            action={
              <Button icon={faPlus} to={NEW_TEMPLATE}>
                Créer un modèle
              </Button>
            }
          />
        )}
      </section>
    </PageLayout>
  );
};

export default Programme;
