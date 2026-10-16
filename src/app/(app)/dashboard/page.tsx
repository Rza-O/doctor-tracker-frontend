'use client';

import { LogOutIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useLogout, useMe } from '@/features/auth/hooks';

// Temporary landing page to exercise the auth flow. M7 replaces it with the
// real app shell (sidebar layout) and M9 with the dashboard.
export default function DashboardPage() {
  const me = useMe();
  const logout = useLogout();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      {me.isPending ? (
        <Spinner />
      ) : me.data ? (
        <>
          <h1 className="text-2xl font-semibold tracking-tight">Hello, {me.data.name}</h1>
          <p className="text-muted-foreground">
            Signed in as {me.data.email} · role <span className="font-medium text-foreground">{me.data.role}</span>
          </p>
          <Button variant="outline" onClick={() => logout.mutate()} disabled={logout.isPending}>
            <LogOutIcon /> Sign out
          </Button>
        </>
      ) : null}
    </main>
  );
}
