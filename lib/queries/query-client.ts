import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { type AppError, isAppError, isUnauthorized } from '@/lib/api/errors';

// Module augmentation: tell TanStack Query what our query functions throw, so
// `error` is typed as AppError in every hook instead of the default Error.
declare module '@tanstack/react-query' {
  interface Register {
    defaultError: AppError;
  }
}

// Retry policy. Retrying a 404 or a validation error only delays the
// inevitable; retry what might work next time (network blips, 5xx).
export function shouldRetry(failureCount: number, error: unknown): boolean {
  return failureCount < 2 && isAppError(error) && error.retryable;
}

// One global place to react to an expired session, instead of every hook
// checking for 401 itself. A full page load also throws away the Redux store
// and the query cache, so nothing from the old session can leak into the next.
function handleSessionExpired(error: unknown) {
  if (
    isUnauthorized(error) &&
    typeof window !== 'undefined' &&
    window.location.pathname !== '/auth'
  ) {
    const from = encodeURIComponent(window.location.pathname);
    // Deliberately not the Next router: this runs outside React, and the
    // full reload is the point.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`/auth?from=${from}`);
  }
}

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({ onError: handleSessionExpired }),
    mutationCache: new MutationCache({ onError: handleSessionExpired }),
    defaultOptions: {
      queries: {
        // How long data counts as fresh. Fresh data is served from the cache
        // with no request; stale data is served AND refetched in the background.
        staleTime: 30_000,
        // How long unused data stays in memory after its last observer
        // unmounts (garbage collection time).
        gcTime: 5 * 60_000,
        retry: shouldRetry,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
      },
      mutations: {
        // A retried POST could create the order twice.
        retry: false,
      },
    },
  });
}
