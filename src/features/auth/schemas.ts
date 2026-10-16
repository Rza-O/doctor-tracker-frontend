import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').pipe(z.email('Enter a valid email address')),
  password: z.string().min(1, 'Password is required'),
});

export type LoginValues = z.infer<typeof loginSchema>;

/**
 * Only allow redirects to paths inside this app. Without this, a crafted link
 * like /login?next=https://evil.example would send users to another site
 * right after they sign in (open redirect).
 */
export function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\') || next.startsWith('/login')) {
    return '/dashboard';
  }
  return next;
}
