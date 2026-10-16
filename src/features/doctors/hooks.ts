'use client';

import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import * as doctorsApi from './api';
import type { DoctorListQuery } from './types';

// Query key factory: one place that defines how doctor data is cached, so
// invalidating "all doctor lists" after a create is a single, typo-free call.
export const doctorKeys = {
  all: ['doctors'] as const,
  lists: () => [...doctorKeys.all, 'list'] as const,
  list: (query: DoctorListQuery) => [...doctorKeys.lists(), query] as const,
  detail: (id: string) => [...doctorKeys.all, 'detail', id] as const,
};

export function useDoctors(query: DoctorListQuery) {
  const queryClient = useQueryClient();
  const result = useQuery({
    // Every parameter is part of the key → each filter combination is cached separately.
    queryKey: doctorKeys.list(query),
    // `signal` lets React Query cancel a request that became outdated (e.g. fast typing).
    queryFn: ({ signal }) => doctorsApi.listDoctors(query, signal),
    // While the next page/filter loads, keep showing the current rows (no flash of empty table).
    placeholderData: keepPreviousData,
  });

  // Prefetch the next page in the background so "Next" feels instant.
  const totalPages = result.data?.totalPages ?? 0;
  useEffect(() => {
    if (query.page < totalPages) {
      const next = { ...query, page: query.page + 1 };
      void queryClient.prefetchQuery({
        queryKey: doctorKeys.list(next),
        queryFn: ({ signal }) => doctorsApi.listDoctors(next, signal),
      });
    }
  }, [query, totalPages, queryClient]);

  return result;
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: doctorKeys.detail(id),
    queryFn: ({ signal }) => doctorsApi.getDoctor(id, signal),
  });
}
