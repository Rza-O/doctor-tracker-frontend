import { apiFetch } from '@/lib/api-client';

export type AIStatus = { enabled: boolean; provider: string | null; model: string | null };
export type AskScope = 'patients' | 'doctors';

/** Validated filters (same names as the list URL params) + a human summary. */
export type AskResult = {
  filters: Record<string, string | number | string[]>;
  explanation: string;
  unsupported: string[];
};

export type Insight = { kind: 'trend' | 'risk' | 'workload' | 'mix'; title: string; detail: string };
export type InsightsResult = { range: string; generatedAt: string; basedOn: string; insights: Insight[]; dropped: number };

export function getInsights(range: string, refresh = false) {
  return apiFetch<InsightsResult>('/ai/insights', { query: { range, refresh: refresh ? '1' : undefined } });
}

export type IntakeResult = {
  fields: Partial<Record<'name' | 'age' | 'gender' | 'phone' | 'email' | 'condition' | 'severity' | 'status' | 'admissionDate', string | number>>;
  missing: string[];
  warnings: string[];
};

export function extractIntake(note: string) {
  return apiFetch<IntakeResult>('/ai/intake', { method: 'POST', body: { note } });
}

export function getAIStatus() {
  return apiFetch<AIStatus>('/ai/status');
}

export function ask(scope: AskScope, query: string) {
  return apiFetch<AskResult>('/ai/search', { method: 'POST', body: { scope, query } });
}
