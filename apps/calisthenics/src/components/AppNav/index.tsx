import { faCalendarWeek, faChartLine, faGraduationCap, faListCheck, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Link, NavLink } from 'react-router';
import { streakDays } from '../../domain/week';
import { useNow } from '../../hooks/useNow';
import { useFetchProfile } from '../../queries/profile';
import { useFetchProgramme } from '../../queries/programme';
import { useFetchSessions } from '../../queries/sessions';
import Brand from '../Brand';
import Icon from '../Icon';
import type { INavItem } from './types';

export type * from './types';

const ITEMS: INavItem[] = [
  { to: '/', label: 'Tableau de bord', short: 'Accueil', icon: faChartLine },
  { to: '/tutoriels', label: 'Tutoriels', short: 'Tutoriels', icon: faGraduationCap },
  { to: '/journal', label: 'Journal de séances', short: 'Journal', icon: faListCheck },
  { to: '/programme', label: 'Programme', short: 'Programme', icon: faCalendarWeek },
];

const NEW_SESSION = '/seance/nouvelle';

/** Main navigation (MOCK-020): fixed sidebar from lg, bottom tab bar with a central CTA below. */
const AppNav = () => {
  const { data: profile } = useFetchProfile();
  const { data: programme } = useFetchProgramme();
  const { data: sessions = [] } = useFetchSessions();
  const now = useNow(60_000);
  const streak = streakDays(programme, sessions, now);
  const initials = profile?.firstName?.slice(0, 2).toUpperCase() ?? '🙂';

  return (
    <>
      <aside
        className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-border bg-surface px-4 py-6 lg:flex"
        aria-label="Navigation principale"
      >
        <Link to="/" className="mb-8 px-2">
          <Brand />
        </Link>
        <nav>
          <ul className="space-y-1">
            {ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-body-s font-medium text-muted hover:bg-neutral-20 hover:text-foreground aria-[current=page]:bg-neutral-150 aria-[current=page]:text-white"
                >
                  <Icon icon={item.icon} className="size-4" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <Link
          to={NEW_SESSION}
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-accent-100 text-body-s font-semibold text-neutral-150 hover:bg-accent-90"
        >
          <Icon icon={faPlus} className="size-3.5" />
          Nouvelle séance
        </Link>
        <div className="mt-auto flex items-center gap-3 rounded-xl bg-neutral-20 p-3">
          <span
            className="grid size-9 place-items-center rounded-full bg-primary-100 text-body-xs font-bold text-white"
            aria-hidden="true"
          >
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-body-s font-semibold">{profile?.firstName ?? 'Toi'}</p>
            <p className="text-body-xs text-muted">
              {streak ? `Régularité : ${streak} jour${streak > 1 ? 's' : ''}` : 'Première séance à venir'}
            </p>
          </div>
        </div>
      </aside>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
        aria-label="Navigation principale"
      >
        <ul className="mx-auto grid max-w-md grid-cols-5 items-end px-2">
          {ITEMS.flatMap((item, index) => [
            ...(index === 2
              ? [
                  <li key="new" className="flex justify-center">
                    <Link
                      to={NEW_SESSION}
                      className="-mt-5 grid size-14 place-items-center rounded-2xl bg-accent-100 text-title-m text-neutral-150 shadow-elevation-2 ring-4 ring-background"
                      aria-label="Nouvelle séance"
                    >
                      <Icon icon={faPlus} className="size-5" />
                    </Link>
                  </li>,
                ]
              : []),
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className="flex min-h-14 flex-col items-center justify-center gap-1 text-body-xs font-medium text-subtle aria-[current=page]:text-foreground"
              >
                <Icon icon={item.icon} className="size-4.5" />
                {item.short}
              </NavLink>
            </li>,
          ])}
        </ul>
      </nav>
    </>
  );
};

export default AppNav;
