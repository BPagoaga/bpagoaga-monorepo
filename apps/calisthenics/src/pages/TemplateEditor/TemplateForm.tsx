import { faCheck, faChevronLeft, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import Button from '../../components/Button';
import ErrorMessage from '../../components/ErrorMessage';
import ExercisePicker from '../../components/ExercisePicker';
import ExerciseRow from '../../components/ExerciseRow';
import Icon from '../../components/Icon';
import TargetFields from '../../components/TargetFields';
import { getExercise } from '../../content/exercises';
import { findStep } from '../../content/progressions';
import { estimatedDuration } from '../../domain/templates';
import type { ITarget, ITemplateItem } from '../../domain/types';
import { useDeleteTemplate, useSaveTemplate } from '../../queries/templates';
import type { ITemplateForm } from './types';

const defaultTarget = (exerciseId: string): ITarget => {
  const step = findStep(exerciseId);
  if (step) return step.progression.steps[step.index].criterion;
  return getExercise(exerciseId)?.measure === 'hold' ? { sets: 3, seconds: 20 } : { sets: 3, reps: 8 };
};

/** Template editor (MOCK-203 v2): name, ordered exercises with structured targets, library on the side. */
const TemplateForm = ({ template, days }: ITemplateForm) => {
  const navigate = useNavigate();
  const save = useSaveTemplate();
  const remove = useDeleteTemplate();
  const [name, setName] = useState(template?.name ?? '');
  const [items, setItems] = useState<ITemplateItem[]>(template?.items ?? []);
  const [submitted, setSubmitted] = useState(false);
  const nameMissing = !name.trim();

  const move = (index: number, offset: number) => {
    const next = [...items];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    setItems(next);
  };
  const toggle = (exerciseId: string) =>
    setItems(
      items.some((item) => item.exerciseId === exerciseId)
        ? items.filter((item) => item.exerciseId !== exerciseId)
        : [...items, { exerciseId, target: defaultTarget(exerciseId) }],
    );

  return (
    <>
      <Link
        to="/programme"
        className="inline-flex min-h-11 items-center gap-2 text-body-s font-medium text-muted hover:text-foreground"
      >
        <Icon icon={faChevronLeft} className="size-3" />
        Programme
      </Link>
      <form
        id="template-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
          if (nameMissing || !items.length) return;
          save.mutate({ id: template?.id, name, items }, { onSuccess: () => navigate('/programme') });
        }}
      >
        <header className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-title-xl">{template ? 'Modifier le modèle' : 'Nouveau modèle'}</h1>
            <p className="mt-1 text-body-m text-muted">
              {days.length ? `Programmé le ${days.join(', ')}` : 'Pas encore programmé'} · environ{' '}
              {estimatedDuration(items)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" to="/programme">
              Annuler
            </Button>
            <Button type="submit" icon={faCheck} loading={save.isPending}>
              Enregistrer
            </Button>
          </div>
        </header>

        <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <div>
              <label htmlFor="template-name" className="text-body-s font-semibold">
                Nom du modèle
              </label>
              <input
                id="template-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                aria-invalid={submitted && nameMissing}
                aria-describedby={submitted && nameMissing ? 'template-name-error' : undefined}
                placeholder="Tirage + gainage"
                className="mt-1 h-11 w-full rounded-lg border border-border bg-surface px-3 text-body-m focus:border-primary-100 focus:outline-hidden focus:ring-4 focus:ring-primary-20 aria-invalid:border-red-100"
              />
              {submitted && nameMissing && (
                <p id="template-name-error" className="mt-1 text-body-xs text-red-120">
                  Donne un nom au modèle, par exemple « Tirage + gainage ».
                </p>
              )}
            </div>
            <section className="space-y-3" aria-labelledby="exercises-title">
              <h2 id="exercises-title" className="text-title-s">
                Exercices <span className="text-body-s font-normal text-muted">· dans l’ordre de la séance</span>
              </h2>
              <p className="text-body-xs text-muted">
                Objectif : séries × répétitions (vide = max) ou secondes, et lest pour les exercices lestables.
              </p>
              {items.length ? (
                <ul className="space-y-2">
                  {items.map((item, index) => {
                    const exercise = getExercise(item.exerciseId);
                    if (!exercise) return null;
                    return (
                      <ExerciseRow
                        key={item.exerciseId}
                        name={exercise.name}
                        family={exercise.family}
                        onMoveUp={index > 0 ? () => move(index, -1) : undefined}
                        onMoveDown={index < items.length - 1 ? () => move(index, 1) : undefined}
                        onRemove={() => setItems(items.filter((_, i) => i !== index))}
                        editor={
                          <TargetFields
                            idPrefix={`target-${index}`}
                            exercise={exercise}
                            target={item.target}
                            onChange={(target) =>
                              setItems(items.map((other, i) => (i === index ? { ...other, target } : other)))
                            }
                          />
                        }
                      />
                    );
                  })}
                </ul>
              ) : (
                <p
                  className={`rounded-2xl border border-dashed p-6 text-center text-body-s ${submitted ? 'border-red-100 text-red-120' : 'border-border text-muted'}`}
                >
                  Ajoute au moins un exercice depuis la bibliothèque.
                </p>
              )}
            </section>
            <ErrorMessage error={save.error ?? remove.error} />
            {template && (
              <div className="border-t border-border pt-6">
                <Button
                  variant="ghost"
                  icon={faTrash}
                  className="text-red-110"
                  loading={remove.isPending}
                  onClick={() => {
                    if (
                      window.confirm(
                        `Supprimer le modèle « ${template.name} » ? Les jours qui l’utilisent passent en repos.`,
                      )
                    ) {
                      remove.mutate(template.id, { onSuccess: () => navigate('/programme') });
                    }
                  }}
                >
                  Supprimer ce modèle
                </Button>
                <p className="mt-1 text-body-xs text-muted">
                  Les séances déjà enregistrées avec ce modèle restent dans le journal.
                </p>
              </div>
            )}
          </div>

          <aside className="space-y-3 xl:sticky xl:top-8 xl:self-start" aria-labelledby="library-title">
            <h2 id="library-title" className="text-title-s">
              Ajouter depuis la bibliothèque
            </h2>
            <ExercisePicker idPrefix="template" selected={items.map((item) => item.exerciseId)} onToggle={toggle} />
          </aside>
        </div>
      </form>
    </>
  );
};

export default TemplateForm;
