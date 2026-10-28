import {
  faArrowRight,
  faBullseye,
  faCalendarWeek,
  faClipboardCheck,
  faPersonRunning,
} from '@fortawesome/free-solid-svg-icons';
import Button from '../../components/Button';
import ErrorMessage from '../../components/ErrorMessage';
import Icon from '../../components/Icon';
import PageLayout from '../../components/PageLayout';
import ProgressChart from '../../components/ProgressChart';
import { useUpdateProfile } from '../../queries/profile';

const STEPS = [
  {
    icon: faClipboardCheck,
    title: 'Test de niveau',
    text: 'Max de tractions, pompes, dips et gainage.',
    to: '/bienvenue/test',
  },
  {
    icon: faBullseye,
    title: 'Choisir une figure',
    text: 'Muscle-up, front lever, handstand… proposée d’après ton test.',
  },
  {
    icon: faCalendarWeek,
    title: 'Planifier ta semaine',
    text: 'Assigne un modèle de séance à 2 à 4 jours, modifiable à tout moment.',
  },
];

/** First launch (MOCK-200 v2): nothing to show yet, the level test is the way in. */
const Welcome = () => {
  const updateProfile = useUpdateProfile();
  return (
    <PageLayout className="mx-auto max-w-3xl space-y-8">
      <header className="text-center">
        <div
          className="mx-auto grid size-16 place-items-center rounded-2xl bg-accent-100 text-neutral-150"
          aria-hidden="true"
        >
          <Icon icon={faPersonRunning} className="size-7" />
        </div>
        <h1 className="mt-5 font-display text-title-xl">Bienvenue sur CaliBuddy</h1>
        <p className="mx-auto mt-2 max-w-md text-body-m text-muted">
          Cinq minutes pour évaluer ton niveau : on place chaque progression à la bonne étape et tu choisis ta figure.
        </p>
      </header>
      <ol className="space-y-3">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className={`flex flex-wrap items-center gap-4 rounded-2xl border bg-surface p-4 ${step.to ? 'border-accent-100 ring-4 ring-accent-20' : 'border-border'}`}
          >
            <span
              className={`grid size-11 shrink-0 place-items-center rounded-xl ${step.to ? 'bg-accent-100 text-neutral-150' : 'bg-neutral-20 text-subtle'}`}
              aria-hidden="true"
            >
              <Icon icon={step.icon} className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-title-s">
                {index + 1}. {step.title}
              </p>
              <p className="text-body-s text-muted">{step.text}</p>
            </div>
            {step.to && (
              <Button variant="accent" iconRight={faArrowRight} to={step.to}>
                Commencer
              </Button>
            )}
          </li>
        ))}
      </ol>
      <p className="text-center text-body-s text-muted">
        Tu préfères t’entraîner tout de suite ?{' '}
        <button
          type="button"
          onClick={() => updateProfile.mutate({ onboardedAt: new Date().toISOString() })}
          className="font-medium text-primary-100 underline hover:text-primary-110"
        >
          Passer le test
        </button>
      </p>
      <ErrorMessage error={updateProfile.error} />
      <ProgressChart title="Volume hebdomadaire" subtitle="répétitions totales" points={[]} />
    </PageLayout>
  );
};

export default Welcome;
