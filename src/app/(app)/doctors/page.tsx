import { PlusIcon, StethoscopeIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/empty-state';
import { Button } from '@/components/ui/button';
import { AdminOnly } from '@/features/auth/components/admin-only';

export const metadata: Metadata = { title: 'Doctors' };

// Placeholder until M8 (table, search, filters, pagination).
export default function DoctorsPage() {
  return (
    <>
      <PageHeader
        title="Doctors"
        description="Browse doctors, filter by specialization or hospital, and open their patient lists."
        actions={
          <AdminOnly>
            <Button disabled>
              <PlusIcon /> Add doctor
            </Button>
          </AdminOnly>
        }
      />
      <EmptyState
        icon={StethoscopeIcon}
        title="Doctor list coming next"
        description="Search, filters and pagination will appear here."
      />
    </>
  );
}
