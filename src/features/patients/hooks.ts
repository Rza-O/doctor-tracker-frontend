'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { Paginated } from '@/lib/types';
import { doctorKeys } from '../doctors/hooks';
import * as patientsApi from './api';
import type { Patient, PatientInput, PatientListQuery } from './types';

export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (query: PatientListQuery, doctorId?: string) => [...patientKeys.lists(), { ...query, doctorId: doctorId ?? null }] as const,
  detail: (id: string) => [...patientKeys.all, 'detail', id] as const,
};

export function usePatients(query: PatientListQuery, doctorId?: string) {
  const queryClient = useQueryClient();
  const result = useQuery({
    queryKey: patientKeys.list(query, doctorId),
    queryFn: ({ signal }) => patientsApi.listPatients(query, doctorId, signal),
    placeholderData: keepPreviousData,
  });

  // Prefetch the next page so "Next" is instant.
  const totalPages = result.data?.totalPages ?? 0;
  useEffect(() => {
    if (query.page < totalPages) {
      const next = { ...query, page: query.page + 1 };
      void queryClient.prefetchQuery({
        queryKey: patientKeys.list(next, doctorId),
        queryFn: ({ signal }) => patientsApi.listPatients(next, doctorId, signal),
      });
    }
  }, [query, doctorId, totalPages, queryClient]);

  return result;
}

/** Finds a patient in any cached list page (to show the side panel instantly). */
function findInLists(queryClient: QueryClient, id: string) {
  for (const [, page] of queryClient.getQueriesData<Paginated<Patient>>({ queryKey: patientKeys.lists() })) {
    const hit = page?.items.find((p) => p._id === id);
    if (hit) return hit;
  }
  return undefined;
}

export function usePatient(id: string | undefined) {
  const queryClient = useQueryClient();
  return useQuery<Patient, Error, Patient, ReturnType<typeof patientKeys.detail>>({
    queryKey: patientKeys.detail(id ?? ''),
    queryFn: ({ signal }) => patientsApi.getPatient(id!, signal),
    enabled: Boolean(id),
    // The row the user clicked is already in a cached list → render it now,
    // then refresh in the background. (Deliberately NOT the previous query's
    // data: that would be a different patient.)
    placeholderData: () => (id ? findInLists(queryClient, id) : undefined),
  });
}

/** Everything that shows patient-derived numbers must refresh after a write. */
function invalidateAfterWrite(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: patientKeys.lists() }),
    queryClient.invalidateQueries({ queryKey: doctorKeys.all }), // patient counts
    queryClient.invalidateQueries({ queryKey: ['stats'] }), // dashboard (M9)
  ]);
}

export function useCreatePatient(doctorId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PatientInput) => patientsApi.createPatient(doctorId, input),
    onSuccess: async (patient) => {
      queryClient.setQueryData(patientKeys.detail(patient._id), patient);
      await invalidateAfterWrite(queryClient);
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<PatientInput> }) => patientsApi.updatePatient(id, patch),
    onSuccess: async (patient) => {
      queryClient.setQueryData(patientKeys.detail(patient._id), patient);
      // Swap the row in place right away (no flicker), then let the lists
      // refetch in case the change moves it out of the current filter.
      queryClient.setQueriesData<Paginated<Patient>>({ queryKey: patientKeys.lists() }, (old) =>
        old ? { ...old, items: old.items.map((p) => (p._id === patient._id ? patient : p)) } : old,
      );
      await invalidateAfterWrite(queryClient);
    },
  });
}

/**
 * Optimistic delete: the row disappears immediately; if the server refuses,
 * every list is restored from the snapshot.
 */
export function useDeletePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: patientsApi.deletePatient,
    onMutate: async (id: string) => {
      // Stop in-flight list fetches so they can't overwrite the optimistic state.
      await queryClient.cancelQueries({ queryKey: patientKeys.lists() });
      const snapshot = queryClient.getQueriesData<Paginated<Patient>>({ queryKey: patientKeys.lists() });
      queryClient.setQueriesData<Paginated<Patient>>({ queryKey: patientKeys.lists() }, (old) => {
        if (!old || !old.items.some((p) => p._id === id)) return old;
        return { ...old, items: old.items.filter((p) => p._id !== id), total: old.total - 1 };
      });
      return { snapshot };
    },
    onError: (_error, _id, context) => {
      context?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: (_data, _error, id) => {
      queryClient.removeQueries({ queryKey: patientKeys.detail(id) });
      return invalidateAfterWrite(queryClient);
    },
  });
}
