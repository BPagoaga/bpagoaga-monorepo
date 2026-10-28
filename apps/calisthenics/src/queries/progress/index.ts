import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listProgress, setProgressStep } from '../../db/progress';
import type { ProgressSourceEnum } from '../../domain/types';
import { invalidateDomains } from '../invalidate';

export const ProgressQueryKeys = { List: 'progress-list' } as const;
export const ProgressStaleTimeEnum = { List: Infinity } as const;

export const useFetchProgress = () =>
  useQuery({ queryKey: [ProgressQueryKeys.List], queryFn: listProgress, staleTime: ProgressStaleTimeEnum.List });

export const useSetProgressStep = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      progressionId,
      step,
      source,
      sessionId,
    }: {
      progressionId: string;
      step: number;
      source: ProgressSourceEnum;
      sessionId?: string;
    }) => setProgressStep(progressionId, step, source, sessionId),
    onSettled: () => invalidateDomains(queryClient, 'progress'),
  });
};
