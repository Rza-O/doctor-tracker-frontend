import { z } from 'zod';
import { csvParam, dateParam, limitParam, pageParam, sortParam, textParam } from '@/lib/url-schemas';

// /doctors?search=rah&specialization=Cardiology,Oncology&from=2026-01-01&sort=name&page=2
export const doctorsUrlSchema = z.object({
  page: pageParam,
  limit: limitParam,
  search: textParam,
  // Validated against /meta values before being sent (they're loaded at runtime).
  specialization: csvParam,
  hospital: csvParam,
  // Date the doctor joined.
  from: dateParam,
  to: dateParam,
  sort: sortParam(['createdAt', 'name'], '-createdAt'),
});

export type DoctorsUrlParams = z.output<typeof doctorsUrlSchema>;
