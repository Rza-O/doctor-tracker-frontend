import { z } from 'zod';
import type { StatRange } from './types';

export const RANGES: { value: StatRange; label: string; short: string }[] = [
  { value: '30d', label: 'Last 30 days', short: '30 days' },
  { value: '90d', label: 'Last 90 days', short: '90 days' },
  { value: '12m', label: 'Last 12 months', short: '12 months' },
];

// /dashboard?range=90d — shareable, survives refresh, Back works.
export const statsUrlSchema = z.object({
  range: z.enum(['30d', '90d', '12m']).catch('12m'),
});
