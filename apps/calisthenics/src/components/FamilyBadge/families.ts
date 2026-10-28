import { faArrowsDownToLine, faCircleDot, faHand, faPersonWalking, faStar } from '@fortawesome/free-solid-svg-icons';
import type { ExerciseFamilyEnum } from '../../domain/types';
import type { IFamilyMeta } from './types';

export const FAMILIES: Record<ExerciseFamilyEnum, IFamilyMeta> = {
  push: { label: 'Poussée', tone: 'primary', icon: faHand },
  pull: { label: 'Tirage', tone: 'blue', icon: faArrowsDownToLine },
  legs: { label: 'Jambes', tone: 'green', icon: faPersonWalking },
  core: { label: 'Gainage', tone: 'orange', icon: faCircleDot },
  skill: { label: 'Figure', tone: 'accent', icon: faStar },
};
