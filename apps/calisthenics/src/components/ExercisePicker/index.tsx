import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { EXERCISES } from '@bpagoaga/calisthenics-core/content/exercises';
import ExerciseRow from '../ExerciseRow';
import Icon from '../Icon';
import type { IExercisePicker } from './types';

export type * from './types';

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

/** Searchable exercise library with Ajouter / Ajouté toggles (template editor, free session). */
const ExercisePicker = ({ selected, onToggle, idPrefix }: IExercisePicker) => {
  const [query, setQuery] = useState('');
  const matches = EXERCISES.filter((exercise) => normalize(exercise.name).includes(normalize(query.trim())));
  return (
    <div className="space-y-3">
      <div className="relative">
        <Icon
          icon={faMagnifyingGlass}
          className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-subtle"
        />
        <input
          id={`${idPrefix}-search`}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher un exercice"
          aria-label="Rechercher un exercice"
          className="h-11 w-full rounded-lg border border-border bg-surface pr-3 pl-9 text-body-s focus:border-primary-100 focus:outline-hidden focus:ring-4 focus:ring-primary-20"
        />
      </div>
      {matches.length ? (
        <ul className="max-h-96 space-y-2 overflow-y-auto pr-1">
          {matches.map((exercise) => (
            <ExerciseRow
              key={exercise.id}
              name={exercise.name}
              family={exercise.family}
              picked={selected.includes(exercise.id)}
              onTogglePick={() => onToggle(exercise.id)}
            />
          ))}
        </ul>
      ) : (
        <p className="py-4 text-center text-body-s text-muted">Aucun exercice ne correspond à « {query} ».</p>
      )}
    </div>
  );
};

export default ExercisePicker;
