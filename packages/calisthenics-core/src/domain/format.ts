import type { IExercise, ISetValue, ITarget } from './types';

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

const longDay = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
const shortDay = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
const weekdayShort = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' });
const monthShort = new Intl.DateTimeFormat('fr-FR', { month: 'short' });
const monthLong = new Intl.DateTimeFormat('fr-FR', { month: 'long' });

/** « Jeudi 23 octobre » */
export const formatLongDay = (date: Date) => capitalize(longDay.format(date));
/** « mar. 21 oct. » */
export const formatShortDay = (date: Date) => shortDay.format(date);
/** « Mar » */
export const formatWeekday = (date: Date) => capitalize(weekdayShort.format(date).replace('.', ''));
/** « oct. » */
export const formatMonthShort = (date: Date) => capitalize(monthShort.format(date));
/** « octobre » */
export const formatMonth = (date: Date) => monthLong.format(date);

/** « 45 min », « 1 h 05 » */
export const formatDuration = (ms: number) => {
  const minutes = Math.max(0, Math.round(ms / 60000));
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')}`;
};

/** « 1:24 », « 24:18 » — a running timer. */
export const formatClock = (ms: number) => {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = String(seconds % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
};

const formatLoad = (loadKg?: number) => (loadKg ? ` · +${loadKg} kg` : '');

/** « 3 × 8 reps », « 3 × 20 s », « 3 × 5 / jambe », « 3 × 5 · +20 kg », « 4 × max » */
export const formatTarget = (target: ITarget, exercise?: Pick<IExercise, 'measure' | 'unilateral'>) => {
  if (target.seconds !== undefined || exercise?.measure === 'hold') {
    return `${target.sets} × ${target.seconds ?? 0} s${formatLoad(target.loadKg)}`;
  }
  const reps = target.reps === 'max' ? 'max' : `${target.reps ?? 0}${exercise?.unilateral ? ' / jambe' : ' reps'}`;
  return `${target.sets} × ${reps}${formatLoad(target.loadKg)}`;
};

/** One logged set: « 12 », « 18 s », « +20 kg × 5 ». */
export const formatSet = (set: ISetValue) => {
  const value = set.seconds !== undefined ? `${set.seconds} s` : `${set.reps ?? 0}`;
  return set.loadKg ? `+${set.loadKg} kg × ${value}` : value;
};

/** A personal record, with its unit: « 14 reps », « 18 s », « +20 kg × 5 ». */
export const formatRecord = (set: ISetValue) => {
  if (set.loadKg) return formatSet(set);
  return set.seconds !== undefined ? `${set.seconds} s` : `${set.reps ?? 0} reps`;
};
