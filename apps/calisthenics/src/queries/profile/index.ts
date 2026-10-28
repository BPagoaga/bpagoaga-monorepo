import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile } from '../../db/profile';
import { invalidateDomains } from '../invalidate';

// Local data only changes through our own mutations: it never goes stale on its own.
export const ProfileQueryKeys = { Profile: 'profile-me' } as const;
export const ProfileStaleTimeEnum = { Profile: Infinity } as const;

export const useFetchProfile = () =>
  useQuery({ queryKey: [ProfileQueryKeys.Profile], queryFn: getProfile, staleTime: ProfileStaleTimeEnum.Profile });

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: updateProfile, onSettled: () => invalidateDomains(queryClient, 'profile') });
};
