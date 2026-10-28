import type { IButton } from '../Button';

export type ISignOutButton = Omit<IButton, 'onClick' | 'loading' | 'icon' | 'to'>;
