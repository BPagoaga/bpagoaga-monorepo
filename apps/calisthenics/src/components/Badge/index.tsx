import Icon from '../Icon';
import type { BadgeTone, IBadge } from './types';

export type * from './types';

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-neutral-20 text-neutral-130',
  primary: 'bg-primary-10 text-primary-120',
  accent: 'bg-accent-10 text-accent-140',
  green: 'bg-green-10 text-green-130',
  orange: 'bg-orange-10 text-orange-140',
  red: 'bg-red-10 text-red-120',
  blue: 'bg-blue-10 text-blue-130',
};

const SIZES = { sm: 'gap-1 px-1.5 py-0.5 text-body-xs', md: 'gap-1.5 px-2.5 py-1 text-body-xs font-medium' };

const Badge = ({ label, tone = 'neutral', icon, size = 'md' }: IBadge) => (
  <span className={`inline-flex items-center rounded-full whitespace-nowrap ${TONES[tone]} ${SIZES[size]}`}>
    {icon && <Icon icon={icon} className="size-2.5" />}
    {label}
  </span>
);

export default Badge;
