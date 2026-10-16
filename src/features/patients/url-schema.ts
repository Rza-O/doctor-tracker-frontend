import { z } from 'zod';
import { csvEnumParam, csvParam, dateParam, limitParam, pageParam, sortParam, textParam } from '@/lib/url-schemas';
import { GENDER_VALUES, SEVERITY_VALUES, STATUS_VALUES } from './constants';

const ageParam = z.coerce.number().int().min(0).max(130).optional().catch(undefined);

// /patients?search=rah&severity=critical&status=admitted&from=2026-01-01&sort=-admissionDate&patient=<id>
export const patientsUrlSchema = z.object({
  page: pageParam,
  limit: limitParam,
  search: textParam,
  // Conditions come from /meta at runtime and are intersected before sending.
  condition: csvParam,
  severity: csvEnumParam(SEVERITY_VALUES),
  status: csvEnumParam(STATUS_VALUES),
  // Gender and age have no toolbar control of their own; they're set by "Ask"
  // and shown as removable badges so an active filter is never invisible.
  gender: csvEnumParam(GENDER_VALUES),
  ageMin: ageParam,
  ageMax: ageParam,
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
