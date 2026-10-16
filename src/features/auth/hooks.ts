'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useHydrated } from '@/hooks/use-hydrated';
import * as authApi from './api';
import type { User } from './types';

export const authKeys = {
  me: ['auth', 'me'] as const,
};

/** The logged-in user. Cached for 5 min; every component shares one request. */
export function useMe() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: authApi.getMe,
    staleTime: 5 * 60_000,
  });
}

/**
 * True only for admins — used to show/hide create, edit and delete actions.
 * Always false until hydration finishes: the server can't know the role, so
 * role-dependent UI must render identically on server and first client pass.
 */
export function useIsAdmin() {
  const hydrated = useHydrated();
  const role = useMe().data?.role;
  return hydrated && role === 'admin';
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.login,
    // The login response already contains the user: seed the cache so the app
    // shell renders immediately without a follow-up /auth/me request.
    onSuccess: (user: User) => queryClient.setQueryData(authKeys.me, user),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: authApi.logout,
    // Even if the request fails, the user wanted out: drop every cached query
    // (no patient data left in memory for the next person) and go to login.
    onSettled: () => {
      queryClient.clear();
      router.replace('/login');
    },
  });
}
