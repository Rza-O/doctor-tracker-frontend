import { z } from 'zod';

// Mirrors the backend's createDoctorSchema for instant feedback. The backend
// still validates everything; this just saves a round trip for obvious mistakes.
export const PHONE_PATTERN = /^\+?[0-9][0-9\s-]{6,19}$/;

export const doctorFormSchema = z.object({
  name: z
    .string()
    .trim()
    .transform((s) => s.replace(/^dr\.?\s+/i, ''))
    // First failing check wins in our resolver → empty shows "required", "A" shows "too short".
    .pipe(z.string().min(1, 'Name is required').min(2, 'Name is too short').max(100, 'Name is too long')),
  // Allowed values come from /meta at runtime; the backend enforces the enum.
  specialization: z.string().min(1, 'Choose a specialization'),
  hospital: z.string().trim().min(2, 'Hospital is required').max(150),
  phone: z.string().trim().regex(PHONE_PATTERN, 'Enter a valid phone number, e.g. +8801711000000'),
  email: z.string().trim().min(1, 'Email is required').pipe(z.email('Enter a valid email address')),
});

export type DoctorFormInput = z.input<typeof doctorFormSchema>;
export type DoctorFormValues = z.output<typeof doctorFormSchema>;
