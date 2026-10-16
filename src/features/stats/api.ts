import { apiFetch } from '@/lib/api-client';
import type { DashboardStats, StatRange } from './types';

export function getStats(range: StatRange, signal?: AbortSignal) {
  return apiFetch<DashboardStats>('/stats', { query: { range }, signal });
}
