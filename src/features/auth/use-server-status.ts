'use client';

import { useEffect, useState } from 'react';

export type ServerStatus = 'checking' | 'waking' | 'online' | 'offline';

const SLOW_AFTER_MS = 2_500; // only mention "waking" if it's actually slow
const RETRY_EVERY_MS = 3_000;
const GIVE_UP_AFTER_MS = 120_000;

/**
 * Pings the API's health endpoint until it answers. The API runs on a free
 * tier that sleeps when idle and needs ~30–50 s to wake, so the login page can
 * explain the wait instead of looking broken.
 */
export function useServerStatus(): ServerStatus {
  const [status, setStatus] = useState<ServerStatus>('checking');

  useEffect(() => {
    let cancelled = false;
    const slowTimer = setTimeout(() => {
      if (!cancelled) setStatus((s) => (s === 'checking' ? 'waking' : s));
    }, SLOW_AFTER_MS);

    (async () => {
      const startedAt = Date.now();
      while (!cancelled && Date.now() - startedAt < GIVE_UP_AFTER_MS) {
        try {
          const res = await fetch('/api/v1/health', { cache: 'no-store', signal: AbortSignal.timeout(15_000) });
          if (res.ok) {
            if (!cancelled) setStatus('online');
            return;
          }
        } catch {
          // still asleep / network hiccup → retry
        }
        await new Promise((resolve) => setTimeout(resolve, RETRY_EVERY_MS));
      }
      if (!cancelled) setStatus('offline');
    })();

    return () => {
      cancelled = true;
      clearTimeout(slowTimer);
    };
  }, []);

  return status;
}
