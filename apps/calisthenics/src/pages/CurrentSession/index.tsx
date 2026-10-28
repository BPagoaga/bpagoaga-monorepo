import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { Navigate } from 'react-router';
import Button from '../../components/Button';
import CurrentSessionPanel from '../../components/CurrentSessionPanel';
import Loading from '../../components/Loading';
import PageLayout from '../../components/PageLayout';
import { useFetchCurrentSession } from '@bpagoaga/calisthenics-api-client';

/** The session in progress, full screen (MOCK-202 v2, the phone's view during a workout). */
const CurrentSession = () => {
  const { data: session, isPending } = useFetchCurrentSession();
  if (isPending) {
    return (
      <PageLayout>
        <Loading />
      </PageLayout>
    );
  }
  if (!session) return <Navigate to="/seance/nouvelle" replace />;
  return (
    <PageLayout className="mx-auto max-w-xl space-y-4">
      <Button variant="ghost" size="sm" icon={faChevronLeft} to="/journal" className="-ml-2 h-11">
        Journal
      </Button>
      <h1 className="sr-only">Séance en cours</h1>
      <CurrentSessionPanel session={session} />
    </PageLayout>
  );
};

export default CurrentSession;
