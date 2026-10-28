import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listLevelTests, saveLevelTest } from '../../db/levelTests';
import { invalidateDomains } from '../invalidate';

export const LevelTestsQueryKeys = { List: 'levelTests-list' } as const;
export const LevelTestsStaleTimeEnum = { List: Infinity } as const;

export const useFetchLevelTests = () =>
  useQuery({ queryKey: [LevelTestsQueryKeys.List], queryFn: listLevelTests, staleTime: LevelTestsStaleTimeEnum.List });

export const useSaveLevelTest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveLevelTest,
    onSettled: () => invalidateDomains(queryClient, 'levelTests', 'progress'),
  });
};
