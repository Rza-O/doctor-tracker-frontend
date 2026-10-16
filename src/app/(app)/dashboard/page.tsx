import { LayoutDashboardIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/empty-state';

export const metadata: Metadata = { title: 'Dashboard' };

// Placeholder until M9 (charts and statistics).
export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" description="Key numbers and trends across doctors and patients." />
      <EmptyState
        icon={LayoutDashboardIcon}
        title="Analytics coming next"
        description="KPIs, admissions over time and patient breakdowns will appear here."
      />
    </>
  );
}
