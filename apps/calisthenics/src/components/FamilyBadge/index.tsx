import Badge from '../Badge';
import { FAMILIES } from './families';
import type { IFamilyBadge } from './types';

export type * from './types';

const FamilyBadge = ({ family, size = 'sm' }: IFamilyBadge) => {
  const { label, tone, icon } = FAMILIES[family];
  return <Badge label={label} tone={tone} icon={icon} size={size} />;
};

export default FamilyBadge;
