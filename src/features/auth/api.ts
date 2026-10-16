import { apiFetch } from '@/lib/api-client';
import type { LoginInput, User } from './types';

// Thin, typed wrappers around the auth endpoints. Tokens never appear here:
// the backend sets and clears them as httpOnly cookies.

export async function login(input: LoginInput): Promise<User> {
  const { user } = await apiFetch<{ user: User }>('/auth/login', { method: 'POST', body: input });
  return user;
}

export async function logout(): Promise<void> {
  await apiFetch<null>('/auth/logout', { method: 'POST' });
}

export async function getMe(): Promise<User> {
  const { user } = await apiFetch<{ user: User }>('/auth/me');
  return user;
}
