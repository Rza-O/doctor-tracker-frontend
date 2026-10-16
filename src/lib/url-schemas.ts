import { z } from 'zod';

// Building blocks for parsing list pages' URL query strings. URLs are typed by
// people and shared around, so every field is LENIENT: an invalid value falls
// back to a default (`.catch`) instead of breaking the page.

export const PAGE_SIZES = [10, 20, 50] as const;

export const pageParam = z.coerce.number().int().min(1).catch(1);

export const limitParam = z.coerce
  .number()
  .int()
  .refine((n) => (PAGE_SIZES as readonly number[]).includes(n))
  .catch(20);

export const textParam = z.string().trim().max(100).optional().catch(undefined);

/** "2026-01-31" or undefined. */
export const dateParam = z.iso.date().optional().catch(undefined);

/** "Asthma,Diabetes" → ['Asthma', 'Diabetes'], keeping only known values. */
export function csvEnumParam<T extends string>(allowed: readonly T[]) {
  return z
    .string()
    .optional()
    .transform((s) => (s ? s.split(',') : []).filter((v): v is T => (allowed as readonly string[]).includes(v)))
    .catch([]);
}

/** Free-text comma list (e.g. hospital names). */
export const csvParam = z
  .string()
  .optional()
  .transform((s) => (s ? s.split(',').map((v) => v.trim()).filter(Boolean) : []))
  .catch([]);

/** "name" / "-name" limited to whitelisted fields. */
export function sortParam<F extends string>(fields: readonly F[], fallback: F | `-${F}`) {
  const allowed = fields.flatMap((f) => [f, `-${f}`]) as [string, ...string[]];
  return z.enum(allowed).catch(fallback) as unknown as z.ZodType<F | `-${F}`>;
}
