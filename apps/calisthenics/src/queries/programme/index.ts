import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getProgramme, setProgrammeDay } from '../../db/programme';
import { invalidateDomains } from '../invalidate';

export const ProgrammeQueryKeys = { Current: 'programme-current' } as const;
export const ProgrammeStaleTimeEnum = { Current: Infinity } as const;

export const useFetchProgramme = () =>
  useQuery({
    queryKey: [ProgrammeQueryKeys.Current],
    queryFn: getProgramme,
    staleTime: ProgrammeStaleTimeEnum.Current,
  });

export const useSetProgrammeDay = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ dayIndex, templateId }: { dayIndex: number; templateId: string | null }) =>
      setProgrammeDay(dayIndex, templateId),
    onSettled: () => invalidateDomains(queryClient, 'programme'),
  });
};
