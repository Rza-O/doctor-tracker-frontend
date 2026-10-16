'use client';

import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';
import { ApiError } from '@/lib/api-client';

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      // A 401 that survived the silent refresh means the session is really
      // over (expired refresh token or logged out elsewhere) → back to login,
      // remembering where the user was.
      onError: (error) => {
        if (error instanceof ApiError && error.status === 401 && window.location.pathname !== '/login') {
          const next = encodeURIComponent(window.location.pathname + window.location.search);
          // Clear the cookies first: a present-but-invalid access cookie would
          // otherwise make the proxy bounce /login → /dashboard → /login forever.
          // Then a deliberately full page load (not router.push): this runs
          // outside React, and a hard reload wipes all in-memory state —
          // including cached patient data — when a session ends.
          fetch('/api/v1/auth/logout', { method: 'POST' })
            .catch(() => undefined)
            // eslint-disable-next-line @next/next/no-location-assign-relative-destination
            .finally(() => window.location.assign(`/login?next=${next}`));
        }
      },
    }),
    defaultOptions: {
      queries: {
        // Data is "fresh" for 30 s: navigating back to a page shows cached
        // data instantly with no request; after that it refetches in the background.
        staleTime: 30_000,
        // Retry only failures that might succeed next time (network, 5xx,
        // a waking server) — never 4xx like validation or permission errors.
        retry: (failureCount, error) => {
          if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
          return failureCount < 2;
        },
      },
      mutations: { retry: false },
    },
  });
}

export function Providers({ children }: { children: ReactNode }) {
  // useState so each browser session gets exactly one client, created once
  // (not on every render, and never shared between users on the server).
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}
