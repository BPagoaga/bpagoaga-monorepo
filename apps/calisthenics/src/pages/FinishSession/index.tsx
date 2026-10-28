import { faCheck, faFaceGrinStars, faFaceSmile, faFaceTired } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { Navigate } from 'react-router';
import Button from '../../components/Button';
import ErrorMessage from '../../components/ErrorMessage';
import Icon from '../../components/Icon';
import Loading from '../../components/Loading';
import PageLayout from '../../components/PageLayout';
import type { FeelingEnum, ISession } from '@bpagoaga/calisthenics-core/domain/types';
import { useFetchCurrentSession, useFinishSession } from '@bpagoaga/calisthenics-api-client';
import Summary from './Summary';
import type { IFeelingOption } from './types';

const FEELINGS: IFeelingOption[] = [
  { value: 'great', label: 'Excellente', icon: faFaceGrinStars },
  { value: 'ok', label: 'Correcte', icon: faFaceSmile },
  { value: 'hard', label: 'Difficile', icon: faFaceTired },
];

const chipClass =
  'inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border px-3 text-body-s font-semibold text-neutral-130 hover:bg-neutral-20 aria-pressed:border-neutral-150 aria-pressed:bg-neutral-150 aria-pressed:text-white';

/** Ends the session in progress: overall feeling, RPE and notes, then the summary. */
const FinishSession = () => {
  const { data: current, isPending } = useFetchCurrentSession();
  const finish = useFinishSession();
  const [finished, setFinished] = useState<ISession>();
  const [feeling, setFeeling] = useState<FeelingEnum>();
  const [rpe, setRpe] = useState<number>();
  const [notes, setNotes] = useState('');

  if (finished) {
    return (
      <PageLayout className="mx-auto max-w-xl space-y-6">
        <Summary session={finished} />
      </PageLayout>
    );
  }
  if (isPending) {
    return (
      <PageLayout>
        <Loading />
      </PageLayout>
    );
  }
  if (!current) return <Navigate to="/journal" replace />;

  return (
    <PageLayout className="mx-auto max-w-xl space-y-6">
      <header>
        <p className="text-body-s text-muted">{current.title}</p>
        <h1 className="font-display text-title-xl">Terminer la séance</h1>
      </header>
      <form
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          finish.mutate(
            { sessionId: current.id, data: { feeling, rpe, notes: notes.trim() || undefined } },
            { onSuccess: (session) => setFinished(session) },
          );
        }}
      >
        <fieldset>
          <legend className="text-title-s">Comment s’est passée la séance ?</legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {FEELINGS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={feeling === option.value}
                onClick={() => setFeeling(option.value)}
                className={chipClass}
              >
                <Icon icon={option.icon} className="size-3.5" />
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-title-s">Effort global (RPE)</legend>
          <div className="mt-2 grid grid-cols-5 gap-2">
            {[6, 7, 8, 9, 10].map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={rpe === value}
                onClick={() => setRpe(value)}
                className={chipClass}
              >
                {value}
              </button>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor="session-notes" className="text-title-s">
            Notes <span className="text-body-s font-normal text-muted">(facultatif)</span>
          </label>
          <textarea
            id="session-notes"
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Coude gauche un peu sensible, bonne énergie…"
            className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-body-m focus:border-primary-100 focus:outline-hidden focus:ring-4 focus:ring-primary-20"
          />
        </div>
        <ErrorMessage error={finish.error} />
        <div className="flex flex-wrap gap-2">
          <Button type="submit" size="lg" icon={faCheck} loading={finish.isPending}>
            Enregistrer la séance
          </Button>
          <Button variant="ghost" size="lg" to="/seance">
            Continuer la séance
          </Button>
        </div>
      </form>
    </PageLayout>
  );
};

export default FinishSession;
