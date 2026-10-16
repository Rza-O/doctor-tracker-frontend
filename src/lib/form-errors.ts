import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ApiError } from './api-client';

/**
 * Puts server-side validation errors onto the matching form fields, so the user
 * sees "This email is already registered" under Email instead of a generic
 * banner. Returns a message for anything that couldn't be mapped to a field
 * (shown in an alert at the top of the form), or null if everything was mapped.
 */
export function applyServerErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  error: unknown,
  fields: readonly Path<T>[],
): string | null {
  if (!(error instanceof ApiError)) return 'Something went wrong. Please try again.';

  // Unique index violation on the backend (duplicate email).
  if (error.status === 409 && fields.includes('email' as Path<T>)) {
    setError('email' as Path<T>, { message: 'This email is already registered' });
    return null;
  }

  // Zod validation details from the backend: [{ path: 'phone', message: '…' }].
  if (error.details?.length) {
    let unmapped = false;
    for (const detail of error.details) {
      if (fields.includes(detail.path as Path<T>)) setError(detail.path as Path<T>, { message: detail.message });
      else unmapped = true;
    }
    return unmapped ? error.message : null;
  }

  return error.message;
}
