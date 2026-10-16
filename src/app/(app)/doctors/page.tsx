import type { Metadata } from 'next';
import { Suspense } from 'react';
import { TableSkeleton } from '@/components/data-table/table-skeleton';
import { PageHeader } from '@/components/page-header';
import { AdminOnly } from '@/features/auth/components/admin-only';
import { AddDoctorDialog } from '@/features/doctors/components/add-doctor-dialog';
import { DoctorsTable } from '@/features/doctors/components/doctors-table';

export const metadata: Metadata = { title: 'Doctors' };

export default function DoctorsPage() {
  return (
    <>
      <PageHeader
        title="Doctors"
        description="Browse doctors, filter by specialization or hospital, and open their patient lists."
        actions={
          <AdminOnly>
            <AddDoctorDialog />
          </AdminOnly>
        }
      />
      {/* The table reads the URL (useSearchParams) → must be inside Suspense. */}
      <Suspense fallback={<TableSkeleton />}>
        <DoctorsTable />
      </Suspense>
    </>
  );
}
