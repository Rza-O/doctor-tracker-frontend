import { useSyncExternalStore } from 'react';

const noopSubscribe = () => () => {};

/**
 * False on the server AND during the browser's hydration render, true after.
 *
 * Use it to gate UI that depends on client-only knowledge (like the user's
 * role, fetched in the browser). Without it, a section that hydrates late can
 * see data the server didn't have, render differently, and cause a hydration
 * mismatch. React renders the server snapshot during hydration, then updates.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
