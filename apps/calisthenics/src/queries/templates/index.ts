import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addItemToTemplate,
  deleteTemplate,
  duplicateTemplate,
  getTemplate,
  listTemplates,
  saveTemplate,
} from '../../db/templates';
import type { ITemplateItem } from '../../domain/types';
import { invalidateDomains } from '../invalidate';

export const TemplatesQueryKeys = { List: 'templates-list', Detail: 'templates-detail' } as const;
export const TemplatesStaleTimeEnum = { List: Infinity, Detail: Infinity } as const;

export const useFetchTemplates = () =>
  useQuery({ queryKey: [TemplatesQueryKeys.List], queryFn: listTemplates, staleTime: TemplatesStaleTimeEnum.List });

export const useFetchTemplate = (id: string | undefined) =>
  useQuery({
    queryKey: [TemplatesQueryKeys.Detail, id],
    queryFn: async () => (id ? ((await getTemplate(id)) ?? null) : null),
    staleTime: TemplatesStaleTimeEnum.Detail,
    enabled: !!id,
  });

const useTemplatesMutation = <TVariables, TResult>(mutationFn: (variables: TVariables) => Promise<TResult>) => {
  const queryClient = useQueryClient();
  // Deleting a template also edits the programme.
  return useMutation({ mutationFn, onSettled: () => invalidateDomains(queryClient, 'templates', 'programme') });
};

export const useSaveTemplate = () => useTemplatesMutation(saveTemplate);
export const useDuplicateTemplate = () => useTemplatesMutation(duplicateTemplate);
export const useDeleteTemplate = () => useTemplatesMutation(deleteTemplate);
export const useAddItemToTemplate = () =>
  useTemplatesMutation(({ id, item }: { id: string; item: ITemplateItem }) => addItemToTemplate(id, item));
