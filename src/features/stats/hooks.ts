'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getStats } from './api';
import type { StatRange } from './types';

export const statsKeys = {
  // Patient writes invalidate ['stats'] (see patients/hooks.ts).
  all: ['stats'] as const,
  range: (range: StatRange) => [...statsKeys.all, range] as const,
};

export function useStats(range: StatRange) {
  return useQuery({
    queryKey: statsKeys.range(range),
    queryFn: ({ signal }) => getStats(range, signal),
    // The API caches stats for 60 s; asking more often can't return anything newer.
    staleTime: 60_000,
    // Switching period keeps the current charts on screen (dimmed) until the
    // new numbers arrive — no skeleton flash, no layout jump.
    placeholderData: keepPreviousData,
  });
}
