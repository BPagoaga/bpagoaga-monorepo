import { useParams } from 'react-router';
import Loading from '../../components/Loading';
import PageLayout from '../../components/PageLayout';
import { scheduledDays } from '@bpagoaga/calisthenics-core/domain/templates';
import { useFetchProgramme, useFetchTemplate } from '@bpagoaga/calisthenics-api-client';
import TemplateForm from './TemplateForm';

/** Create (`/programme/modeles/nouveau`) or edit a session template. */
const TemplateEditor = () => {
  const { templateId } = useParams();
  const template = useFetchTemplate(templateId ?? '');
  const programme = useFetchProgramme();

  if ((templateId && template.isPending) || programme.isPending) {
    return (
      <PageLayout>
        <Loading />
      </PageLayout>
    );
  }
  if (templateId && !template.data) {
    return (
      <PageLayout>
        <p className="text-body-m">Ce modèle n’existe plus. Il a peut-être été supprimé.</p>
      </PageLayout>
    );
  }
  return (
    <PageLayout className="">
      {/* Keyed: the form's state starts from the loaded template. */}
      <TemplateForm
        key={template.data?.id ?? 'new'}
        template={template.data ?? undefined}
        days={template.data ? scheduledDays(template.data.id, programme.data) : []}
      />
    </PageLayout>
  );
};

export default TemplateEditor;
