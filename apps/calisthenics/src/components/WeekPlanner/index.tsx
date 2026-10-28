import {
  faCalendar,
  faCheck,
  faCircleCheck,
  faCircleDot,
  faCircleXmark,
  faMugHot,
} from '@fortawesome/free-solid-svg-icons';
import { formatWeekday } from '../../domain/format';
import type { DayStatusEnum } from '../../domain/types';
import Icon from '../Icon';
import type { IIconLabel, IWeekPlanner } from './types';

export type * from './types';

const STATUSES: Record<DayStatusEnum, IIconLabel> = {
  done: { label: 'faite', icon: faCircleCheck, className: 'text-green-120' },
  today: { label: 'aujourd’hui', icon: faCircleDot, className: 'text-accent-130' },
  planned: { label: 'prévue', icon: faCalendar, className: 'text-subtle' },
  missed: { label: 'manquée', icon: faCircleXmark, className: 'text-red-110' },
  rest: { label: 'repos', icon: faMugHot, className: 'text-subtle' },
};

/** The programme's week (MOCK-028): a read-only strip, or one select per day in plan mode. */
const WeekPlanner = ({ days, templates, onChange, disabled }: IWeekPlanner) => {
  const nameOf = (templateId?: string) => templates.find((template) => template.id === templateId)?.name;

  if (onChange) {
    return (
      <ol className="grid gap-2 sm:grid-cols-2 2xl:grid-cols-7">
        {days.map((day) => {
          const { isToday } = day;
          const id = `plan-${day.dayIndex}`;
          return (
            <li
              key={day.dayIndex}
              className={`flex items-center gap-3 rounded-xl border p-3 2xl:flex-col 2xl:items-stretch ${isToday ? 'border-accent-100 bg-accent-10' : 'border-border bg-surface'}`}
              aria-current={isToday ? 'date' : undefined}
            >
              <div className="w-20 shrink-0 2xl:w-auto">
                <p className="text-body-s font-semibold">
                  {formatWeekday(day.date)} {day.date.getDate()}
                </p>
                {isToday ? (
                  <p className="text-body-xs font-semibold text-accent-140">Aujourd’hui</p>
                ) : (
                  day.status === 'done' && (
                    <p className="flex items-center gap-1 text-body-xs text-green-120">
                      <Icon icon={faCheck} className="size-2.5" /> Faite
                    </p>
                  )
                )}
              </div>
              <label className="sr-only" htmlFor={id}>
                Séance du {formatWeekday(day.date)} {day.date.getDate()}
              </label>
              <select
                id={id}
                value={day.templateId ?? ''}
                disabled={disabled}
                onChange={(event) => onChange(day.dayIndex, event.target.value || null)}
                className={`h-11 w-full min-w-0 rounded-lg border border-border bg-surface px-2 text-body-s focus:border-primary-100 focus:outline-hidden focus:ring-4 focus:ring-primary-20 ${day.templateId ? 'font-medium' : 'text-subtle'}`}
              >
                <option value="">Repos</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <ol className="grid grid-cols-7 gap-1.5 sm:gap-2" aria-label="Séances de la semaine">
      {days.map((day) => {
        const status = STATUSES[day.status];
        const isToday = day.status === 'today';
        const name = nameOf(day.templateId) ?? (day.status === 'done' ? 'Séance libre' : 'Repos');
        return (
          <li
            key={day.dayIndex}
            className={`flex min-w-0 flex-col items-center gap-1 rounded-xl border px-1 py-2 text-center sm:py-3 ${isToday ? 'border-accent-100 bg-accent-10' : 'border-border bg-surface'}`}
            aria-current={isToday ? 'date' : undefined}
          >
            <span className="text-body-xs font-medium text-muted">{formatWeekday(day.date)}</span>
            <span className={`font-display text-title-s ${day.status === 'rest' ? 'text-subtle' : ''}`}>
              {day.date.getDate()}
            </span>
            <Icon icon={status.icon} className={`size-3.5 ${status.className}`} />
            <span
              className={`hidden w-full truncate text-body-xs md:block ${isToday ? 'font-semibold' : 'text-muted'}`}
            >
              {name}
            </span>
            <span className="sr-only">
              {name}, {status.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
};

export default WeekPlanner;
