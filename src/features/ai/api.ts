import { apiFetch } from '@/lib/api-client';

export type AIStatus = { enabled: boolean; provider: string | null; model: string | null };
export type AskScope = 'patients' | 'doctors';

/** Validated filters (same names as the list URL params) + a human summary. */
export type AskResult = {
  filters: Record<string, string | number | string[]>;
  explanation: string;
  unsupported: string[];
};

export function getAIStatus() {
  return apiFetch<AIStatus>('/ai/status');
}

export function ask(scope: AskScope, query: string) {
  return apiFetch<AskResult>('/ai/search', { method: 'POST', body: { scope, query } });
}
