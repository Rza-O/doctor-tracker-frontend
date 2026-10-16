import { CloudOffIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import type { ServerStatus } from '../use-server-status';

export function ServerStatusNotice({ status }: { status: ServerStatus }) {
  if (status === 'waking') {
    return (
      <Alert role="status">
        <Spinner />
        <AlertTitle>Waking up the server…</AlertTitle>
        <AlertDescription>
          The demo API sleeps when idle and takes up to a minute to start. You can sign in as soon as it&apos;s ready.
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'offline') {
    return (
      <Alert variant="destructive">
        <CloudOffIcon />
        <AlertTitle>Server unreachable</AlertTitle>
        <AlertDescription>The API didn&apos;t respond. Please refresh the page in a moment.</AlertDescription>
      </Alert>
    );
  }

  return null;
}
