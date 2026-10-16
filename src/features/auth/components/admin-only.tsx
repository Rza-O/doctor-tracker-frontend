'use client';

import type { ReactNode } from 'react';
import { useIsAdmin } from '../hooks';

/**
 * Renders its children only for admins (create / edit / delete actions).
 * Hidden while the role is still loading, so viewers never see a flash of
 * admin buttons. This is UX only — the API enforces the role on every write.
 */
export function AdminOnly({ children }: { children: ReactNode }) {
  return useIsAdmin() ? children : null;
}
