'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useHydrated } from '@/hooks/use-hydrated';
import * as aiApi from './api';
import type { AskScope } from './api';

/** Whether the server has AI configured. AI UI renders only when this is true. */
export function useAIEnabled() {
  const hydrated = useHydrated();
  const status = useQuery({ queryKey: ['ai', 'status'], queryFn: aiApi.getAIStatus, staleTime: 10 * 60_000 });
  // Hidden until hydrated → server and first client render match.
  return hydrated && status.data?.enabled === true;
}

export function useAsk(scope: AskScope) {
  return useMutation({ mutationFn: (query: string) => aiApi.ask(scope, query) });
}

export function useIntake() {
  return useMutation({ mutationFn: aiApi.extractIntake });
}

const insightsKey = (range: string) => ['ai', 'insights', range] as const;

/** Insights for a period — the server caches them 10 min, so we do too. */
export function useInsights(range: string, enabled: boolean) {
  return useQuery({
    queryKey: insightsKey(range),
    queryFn: () => aiApi.getInsights(range),
    enabled,
    staleTime: 10 * 60_000,
    retry: 1,
  });
}

/** "Regenerate": bypasses both caches and replaces the cached result. */
export function useRegenerateInsights(range: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => aiApi.getInsights(range, true),
    onSuccess: (data) => queryClient.setQueryData(insightsKey(range), data),
  });
}
