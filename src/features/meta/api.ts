import { apiFetch } from '@/lib/api-client';

// Dropdown values shared with the backend (GET /meta) — the single source of
// truth for specializations, conditions, etc.
export type Meta = {
  specializations: string[];
  conditions: string[];
  severities: string[];
  statuses: string[];
  genders: string[];
  hospitals: string[];
};

export function getMeta(): Promise<Meta> {
  return apiFetch<Meta>('/meta');
}
