'use client';

import { ErrorState } from '@/components/states';

// Error boundary for every page inside the app shell: if a page crashes while
// rendering, the sidebar and header stay usable and the user can retry,
// instead of facing a blank screen.
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorState error={error} onRetry={reset} title="This page failed to load" />;
}
