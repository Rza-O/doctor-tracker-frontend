'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
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
