import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageHeader } from '@/components/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardView } from '@/features/stats/components/dashboard-view';

export const metadata: Metadata = { title: 'Dashboard' };

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" description="Key numbers and trends across doctors and patients." />
      {/* Reads ?range= from the URL → inside Suspense. */}
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <DashboardView />
      </Suspense>
    </>
  );
}
