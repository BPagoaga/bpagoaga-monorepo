import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { useSignOut } from '../../queries/auth';
import Button from '../Button';
import type { ISignOutButton } from './types';

export type * from './types';

/**
 * Signs out; the route guard then shows the sign-in page, which leads back here. Without children, an icon button
 * labelled for screen readers.
 */
const SignOutButton = ({ children, variant = 'ghost', ...button }: ISignOutButton) => {
  const signOut = useSignOut();
  return (
    <Button
      variant={variant}
      icon={faRightFromBracket}
      aria-label={children ? undefined : 'Se déconnecter'}
      title={children ? undefined : 'Se déconnecter'}
      loading={signOut.isPending}
      onClick={() => signOut.mutate()}
      {...button}
    >
      {children}
    </Button>
  );
};

export default SignOutButton;
