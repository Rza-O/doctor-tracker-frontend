import { useSyncExternalStore } from 'react';

/**
 * Current time that re-renders the component every `intervalMs` — for
 * "updated 20s ago" style labels. Server snapshot is 0 so callers can skip
 * rendering relative times until the client takes over (no hydration mismatch).
 */
export function useNow(intervalMs = 15_000): number {
  return useSyncExternalStore(
    (onChange) => {
      const id = setInterval(onChange, intervalMs);
      return () => clearInterval(id);
    },
    () => Math.floor(Date.now() / intervalMs) * intervalMs,
    () => 0,
  );
}
