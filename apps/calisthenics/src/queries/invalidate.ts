import type { QueryClient } from '@tanstack/react-query';

/**
 * Query keys start with their domain name (`sessions-list`): invalidate a whole domain at once. Inactive queries are
 * refetched too (IndexedDB reads are cheap), so a screen opened right after a mutation never renders stale data.
 */
export const invalidateDomains = (queryClient: QueryClient, ...domains: string[]) =>
  queryClient.invalidateQueries({
    predicate: (query) => domains.some((domain) => String(query.queryKey[0]).startsWith(`${domain}-`)),
    refetchType: 'all',
  });
