import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router';
import Icon from '../Icon';
import type { ButtonSize, ButtonVariant, IButton } from './types';

export type * from './types';

// Classes from the validated mockup macro (apps/mockups/_includes/macros/proposals/button.njk).
const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary-100 text-white hover:bg-primary-110 active:bg-primary-120 disabled:bg-primary-40',
  accent:
    'bg-accent-100 text-neutral-150 hover:bg-accent-90 active:bg-accent-110 disabled:bg-accent-30 disabled:text-neutral-90',
  secondary:
    'bg-neutral-20 text-neutral-140 hover:bg-neutral-30 active:bg-neutral-40 disabled:bg-neutral-20 disabled:text-neutral-60',
  outline:
    'border border-primary-100 bg-surface text-primary-100 hover:bg-primary-10 active:bg-primary-20 disabled:border-primary-40 disabled:text-primary-40 disabled:bg-surface',
  ghost:
    'bg-transparent text-neutral-130 hover:bg-neutral-20 active:bg-neutral-30 disabled:text-neutral-60 disabled:bg-transparent',
  danger: 'bg-red-100 text-white hover:bg-red-110 active:bg-red-120 disabled:bg-red-40',
};

const ICON_SIZES: Record<ButtonSize, string> = { sm: 'size-3', md: 'size-3.5', lg: 'size-4' };

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 rounded-md px-3 text-body-xs font-semibold',
  md: 'h-10 gap-2 rounded-lg px-4 text-body-s font-semibold',
  lg: 'h-12 gap-2 rounded-xl px-5 text-body-m font-semibold',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  to,
  loading = false,
  className = '',
  type = 'button',
  disabled,
  ...props
}: IButton) => {
  const iconOnly = !children;
  const classes = `inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-100 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${iconOnly ? 'aspect-square px-0!' : ''} ${className}`;
  const content = (
    <>
      {loading ? (
        <Icon icon={faCircleNotch} className={`${ICON_SIZES[size]} animate-spin`} />
      ) : (
        icon && <Icon icon={icon} className={ICON_SIZES[size]} />
      )}
      {children && <span>{children}</span>}
      {iconRight && <Icon icon={iconRight} className={ICON_SIZES[size]} />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} aria-label={props['aria-label']}>
        {content}
      </Link>
    );
  }
  return (
    <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {content}
    </button>
  );
};

export default Button;
