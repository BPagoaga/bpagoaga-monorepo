import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addSessionExercise,
  deleteSession,
  finishSession,
  getCurrentSession,
  listSessions,
  logSet,
  removeLastSet,
  startSession,
} from '../../db/sessions';
import type { FeelingEnum, ILoggedSet } from '../../domain/types';
import { invalidateDomains } from '../invalidate';

export const SessionsQueryKeys = { List: 'sessions-list', Current: 'sessions-current' } as const;
export const SessionsStaleTimeEnum = { List: Infinity, Current: Infinity } as const;

export const useFetchSessions = () =>
  useQuery({ queryKey: [SessionsQueryKeys.List], queryFn: listSessions, staleTime: SessionsStaleTimeEnum.List });

export const useFetchCurrentSession = () =>
  useQuery({
    queryKey: [SessionsQueryKeys.Current],
    queryFn: getCurrentSession,
    staleTime: SessionsStaleTimeEnum.Current,
  });

const useSessionsMutation = <TVariables, TResult>(mutationFn: (variables: TVariables) => Promise<TResult>) => {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn, onSettled: () => invalidateDomains(queryClient, 'sessions') });
};

export const useStartSession = () => useSessionsMutation(startSession);
export const useLogSet = () =>
  useSessionsMutation(
    ({ id, exerciseIndex, set }: { id: string; exerciseIndex: number; set: Omit<ILoggedSet, 'doneAt'> }) =>
      logSet(id, exerciseIndex, set),
  );
export const useRemoveLastSet = () =>
  useSessionsMutation(({ id, exerciseIndex }: { id: string; exerciseIndex: number }) =>
    removeLastSet(id, exerciseIndex),
  );
export const useAddSessionExercise = () =>
  useSessionsMutation(({ id, exerciseId }: { id: string; exerciseId: string }) => addSessionExercise(id, exerciseId));
export const useFinishSession = () =>
  useSessionsMutation(({ id, ...summary }: { id: string; rpe?: number; feeling?: FeelingEnum; notes?: string }) =>
    finishSession(id, summary),
  );
export const useDeleteSession = () => useSessionsMutation(deleteSession);
