import type { FieldErrors, FieldValues, Resolver } from 'react-hook-form';
import type { z } from 'zod';

/**
 * Connects a Zod schema to react-hook-form.
 *
 * Written here instead of installing @hookform/resolvers: that package's
 * optional adapters currently pull in a Zod 3 peer dependency that conflicts
 * with Zod 4, and forcing the install would hide real conflicts.
 *
 * Our forms are flat (no nested objects), so issue paths map directly to
 * field names.
 */
export function zodResolver<S extends z.ZodType<FieldValues, FieldValues>>(
  schema: S,
): Resolver<z.input<S>, unknown, z.output<S>> {
  return async (values) => {
    const result = await schema.safeParseAsync(values);
    if (result.success) return { values: result.data, errors: {} };

    const errors: Record<string, { type: string; message: string }> = {};
    for (const issue of result.error.issues) {
      const field = issue.path.join('.') || 'root';
      errors[field] ??= { type: issue.code, message: issue.message }; // first error per field
    }
    return { values: {}, errors: errors as FieldErrors<z.input<S>> };
  };
}
