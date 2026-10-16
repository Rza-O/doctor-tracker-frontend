'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { z } from 'zod';

type ParamValue = string | number | readonly string[] | null | undefined;

type SetOptions = {
  /**
   * 'push' (default) adds a history entry so Back undoes a filter change.
   * 'replace' is for high-frequency updates like typing in search, so the
   * history isn't flooded with one entry per keystroke.
   */
  history?: 'push' | 'replace';
  /** Filter/sort changes start again at page 1. Off for things like opening a side panel. */
  resetPage?: boolean;
};

/**
 * List-page state (search, filters, sort, page) stored in the URL instead of
 * React state: links are shareable, Back/Forward work, and a refresh keeps
 * everything. The Zod schema turns the raw query string into typed values.
 *
 * Must be used inside a <Suspense> boundary (Next requirement for useSearchParams).
 */
export function useListParams<S extends z.ZodType>(schema: S) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const query = searchParams.toString();

  const params = useMemo(() => schema.parse(Object.fromEntries(new URLSearchParams(query))) as z.output<S>, [schema, query]);

  const setParams = useCallback(
    (patch: Record<string, ParamValue>, { history = 'push', resetPage = true }: SetOptions = {}) => {
      const next = new URLSearchParams(query);
      for (const [key, value] of Object.entries(patch)) {
        const empty = value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
        if (empty) next.delete(key);
        else next.set(key, Array.isArray(value) ? value.join(',') : String(value));
      }
      // Changing a filter or sort invalidates the current page number.
      if (resetPage && !('page' in patch)) next.delete('page');

      const qs = next.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      if (history === 'replace') router.replace(url, { scroll: false });
      else router.push(url, { scroll: false });
    },
    [query, pathname, router],
  );

  /**
   * Remove all filters but keep the page size the user chose — optionally
   * applying a fresh set of filters in the same navigation (used by "Ask").
   */
  const clearParams = useCallback(
    (keep: string[] = ['limit'], apply: Record<string, ParamValue> = {}) => {
      const next = new URLSearchParams();
      for (const key of keep) {
        const value = searchParams.get(key);
        if (value) next.set(key, value);
      }
      for (const [key, value] of Object.entries(apply)) {
        const empty = value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
        if (!empty) next.set(key, Array.isArray(value) ? value.join(',') : String(value));
      }
      const qs = next.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, pathname, router],
  );

  return { params, setParams, clearParams };
}
