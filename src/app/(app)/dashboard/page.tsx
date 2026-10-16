'use client';

import { useMe } from '@/features/auth/hooks';

// Temporary content until the real dashboard in M9.
export default function DashboardPage() {
  const { data: user } = useMe();

  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground">
        {user ? `Welcome back, ${user.name.split(' ')[0]}.` : 'Loading…'} Charts and statistics arrive in the next milestone.
      </p>
    </div>
  );
}
