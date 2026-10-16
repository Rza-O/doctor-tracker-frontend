'use client';

import { useQuery } from '@tanstack/react-query';
import { getMeta } from './api';

/**
 * Enum lists for filters and forms. They practically never change, so they're
 * fetched once per session and shared by every dropdown on every page.
 */
export function useMeta() {
  return useQuery({
    queryKey: ['meta'],
    queryFn: getMeta,
    staleTime: 60 * 60_000,
    gcTime: Infinity,
  });
}

/** ['Asthma', ...] → [{ value: 'Asthma', label: 'Asthma' }, ...] for filters. */
export const toOptions = (values: readonly string[] | undefined, label: (v: string) => string = (v) => v) =>
  (values ?? []).map((value) => ({ value, label: label(value) }));
