import { format } from 'date-fns';
import { z } from 'zod';
import { PHONE_PATTERN } from '../doctors/schemas';
import { GENDER_VALUES, SEVERITY_VALUES, STATUS_VALUES } from './constants';

// Form values are strings (that's what inputs hold); the schema converts them
// to the API's types (e.g. age "42" → 42). Mirrors the backend's rules.
export const patientFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').min(2, 'Name is too short').max(100, 'Name is too long'),
  age: z
    .string()
    .trim()
    .min(1, 'Age is required')
    .pipe(z.coerce.number<string>().int('Use whole years').min(0, 'Age must be 0 or more').max(130, 'Age must be 130 or less')),
  gender: z.enum(GENDER_VALUES, { error: 'Choose a gender' }),
  phone: z.string().trim().regex(PHONE_PATTERN, 'Enter a valid phone number, e.g. +8801811000000'),
  // Optional: empty means "no email" (the backend stores null).
  email: z
    .string()
    .trim()
    .refine((v) => v === '' || z.email().safeParse(v).success, 'Enter a valid email address'),
  condition: z.string().min(1, 'Choose a condition'),
  severity: z.enum(SEVERITY_VALUES, { error: 'Choose a severity' }),
  status: z.enum(STATUS_VALUES, { error: 'Choose a status' }),
  admissionDate: z
    .string()
    .min(1, 'Admission date is required')
    .refine((d) => d <= format(new Date(), 'yyyy-MM-dd'), 'Admission date cannot be in the future'),
});

export type PatientFormInput = z.input<typeof patientFormSchema>;
export type PatientFormValues = z.output<typeof patientFormSchema>;
