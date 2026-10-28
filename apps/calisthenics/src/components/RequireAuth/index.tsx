import { Navigate, Outlet, useLocation, useSearchParams } from 'react-router';
import { useFetchAuthSession } from '../../queries/auth';
import Button from '../Button';
import ErrorMessage from '../ErrorMessage';
import Loading from '../Loading';
import { safeReturnPath } from './returnPath';
import type { IRequireAuth } from './types';

export type * from './types';

/** Route guard: renders the child routes for the right audience, redirects everyone else. */
const RequireAuth = ({ when }: IRequireAuth) => {
  const session = useFetchAuthSession();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  if (session.isPending) return <Loading />;
  if (session.isError)
    return (
      <main className="mx-auto max-w-md space-y-4 px-4 py-16">
        <ErrorMessage error={session.error} />
        <Button variant="secondary" onClick={() => void session.refetch()}>
          Réessayer
        </Button>
      </main>
    );

  if (when === 'signed-in' && !session.data) {
    const back = `${location.pathname}${location.search}`;
    return <Navigate to={back === '/' ? '/connexion' : `/connexion?retour=${encodeURIComponent(back)}`} replace />;
  }
  if (when === 'signed-out' && session.data)
    return <Navigate to={safeReturnPath(searchParams.get('retour'))} replace />;
  return <Outlet />;
};

export default RequireAuth;
