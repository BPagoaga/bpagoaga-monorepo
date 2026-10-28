import { addDays, dayIndex, isSameDay, startOfDay, startOfWeek } from './dates';
import type { IProgramme, ISession, IWeekDay } from './types';

const finishedOn = (sessions: ISession[], date: Date) =>
  sessions.find((session) => session.endedAt && isSameDay(new Date(session.startedAt), date));

const dayOf = (programme: IProgramme | undefined, sessions: ISession[], date: Date, now: Date): IWeekDay => {
  const index = dayIndex(date);
  const templateId = programme?.days[index]?.templateId;
  const session = finishedOn(sessions, date);
  const today = isSameDay(date, now);
  const past = startOfDay(date).getTime() < startOfDay(now).getTime();
  const status = session ? 'done' : today && templateId ? 'today' : !templateId ? 'rest' : past ? 'missed' : 'planned';
  return { date, dayIndex: index, templateId, sessionId: session?.id, status, isToday: today };
};

/** The seven days of the current week, Monday first. */
export const weekDays = (programme: IProgramme | undefined, sessions: ISession[], now: Date): IWeekDay[] => {
  const monday = startOfWeek(now);
  return Array.from({ length: 7 }, (_, index) => dayOf(programme, sessions, addDays(monday, index), now));
};

/** The planned session of today, if any and not done yet. */
export const todayTemplateId = (programme: IProgramme | undefined, sessions: ISession[], now: Date) => {
  const today = dayOf(programme, sessions, startOfDay(now), now);
  return today.status === 'today' ? today.templateId : undefined;
};

/**
 * « 12 jours de régularité »: days since the last planned day without a session, counted from the first session.
 * 0 without any finished session.
 */
export const streakDays = (programme: IProgramme | undefined, sessions: ISession[], now: Date) => {
  const starts = sessions.filter((session) => session.endedAt).map((session) => new Date(session.startedAt).getTime());
  if (!starts.length) return 0;
  const first = startOfDay(new Date(Math.min(...starts)));
  let streak = 0;
  // Today is not over: a planned session later today is not missed yet.
  for (let date = addDays(startOfDay(now), -1); date.getTime() >= first.getTime(); date = addDays(date, -1)) {
    if (dayOf(programme, sessions, date, now).status === 'missed') return streak + 1;
    streak += 1;
  }
  return streak + 1;
};
