import { z } from 'zod';
import { csvEnumParam, csvParam, dateParam, limitParam, pageParam, sortParam, textParam } from '@/lib/url-schemas';
import { SEVERITY_VALUES, STATUS_VALUES } from './constants';

// /patients?search=rah&severity=critical&status=admitted&from=2026-01-01&sort=-admissionDate&patient=<id>
export const patientsUrlSchema = z.object({
  page: pageParam,
  limit: limitParam,
  search: textParam,
  // Conditions come from /meta at runtime and are intersected before sending.
  condition: csvParam,
  severity: csvEnumParam(SEVERITY_VALUES),
  status: csvEnumParam(STATUS_VALUES),
  // Admission date range.
  from: dateParam,
  to: dateParam,
  sort: sortParam(['admissionDate', 'name', 'age'], '-admissionDate'),
  // The patient open in the side panel → deep-linkable, Back closes it.
  patient: z
    .string()
    .regex(/^[a-f\d]{24}$/i)
    .optional()
    .catch(undefined),
});
