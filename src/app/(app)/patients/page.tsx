import type { Metadata } from 'next';
import { Suspense } from 'react';
import { TableSkeleton } from '@/components/data-table/table-skeleton';
import { PageHeader } from '@/components/page-header';
import { PatientsTable } from '@/features/patients/components/patients-table';

export const metadata: Metadata = { title: 'Patients' };

export default function PatientsPage() {
  return (
    <>
      <PageHeader
        title="Patients"
        description="Search and filter every patient. Open a row for details; new patients are added from their doctor's page."
      />
      <Suspense fallback={<TableSkeleton />}>
        <PatientsTable />
      </Suspense>
    </>
  );
}
