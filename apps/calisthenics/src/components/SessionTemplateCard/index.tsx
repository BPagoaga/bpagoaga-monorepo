import { faClockRotateLeft, faCopy, faPen } from '@fortawesome/free-solid-svg-icons';
import Button from '../Button';
import FamilyBadge from '../FamilyBadge';
import Icon from '../Icon';
import RadioMark from '../RadioMark';
import type { ISessionTemplateCard } from './types';

export type * from './types';

/** A session template (MOCK-029): manage mode with Edit / Duplicate, or a radio card to start a session. */
const SessionTemplateCard = ({
  title,
  subtitle,
  lines,
  family,
  badge,
  footnote,
  editTo,
  onDuplicate,
  radio,
}: ISessionTemplateCard) => {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {badge && <p className="text-body-xs font-semibold uppercase tracking-wide text-accent-130">{badge}</p>}
          <h3 className="text-title-s">{title}</h3>
          <p className="mt-0.5 text-body-xs text-muted">{subtitle}</p>
        </div>
        {radio ? <RadioMark /> : family && <FamilyBadge family={family} />}
      </div>
      <ol className="mt-3 space-y-1.5">
        {lines.map((line, index) => (
          <li key={`${line.name}-${index}`} className="flex items-baseline justify-between gap-3 text-body-s">
            <span className="min-w-0 truncate">{line.name}</span>
            <span className="shrink-0 font-mono text-body-xs text-muted">{line.detail}</span>
          </li>
        ))}
      </ol>
      {footnote && (
        <p className="mt-3 flex items-center gap-1.5 border-t border-border pt-2 text-body-xs text-muted">
          <Icon icon={faClockRotateLeft} className="size-3" />
          {footnote}
        </p>
      )}
    </>
  );

  if (radio) {
    return (
      <label className="group block cursor-pointer rounded-2xl border border-border bg-surface p-4 transition hover:border-neutral-60 has-checked:border-accent-100 has-checked:ring-4 has-checked:ring-accent-20 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary-100">
        <input type="radio" name={radio.name} checked={radio.checked} onChange={radio.onChange} className="sr-only" />
        {body}
      </label>
    );
  }

  return (
    <article className="flex flex-col rounded-2xl border border-border bg-surface p-4">
      <div className="flex-1">{body}</div>
      <div className="mt-4 flex gap-2">
        {editTo && (
          <Button variant="secondary" size="sm" icon={faPen} to={editTo}>
            Modifier
          </Button>
        )}
        {onDuplicate && (
          <Button variant="ghost" size="sm" icon={faCopy} onClick={onDuplicate}>
            Dupliquer
          </Button>
        )}
      </div>
    </article>
  );
};

export default SessionTemplateCard;
