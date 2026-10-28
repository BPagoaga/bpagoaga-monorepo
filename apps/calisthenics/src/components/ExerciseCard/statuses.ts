import { faCheck, faCircle, faLock, faSpinner } from '@fortawesome/free-solid-svg-icons';
import type { ExerciseStatusEnum } from '@bpagoaga/calisthenics-core/domain/types';
import type { IStatusMeta } from './types';

export const EXERCISE_STATUSES: Record<ExerciseStatusEnum, IStatusMeta> = {
  locked: { label: 'Verrouillé', tone: 'neutral', icon: faLock },
  todo: { label: 'À découvrir', tone: 'neutral', icon: faCircle },
  'in-progress': { label: 'En cours', tone: 'orange', icon: faSpinner },
  mastered: { label: 'Maîtrisé', tone: 'green', icon: faCheck },
};
