import { UsersIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/empty-state';

export const metadata: Metadata = { title: 'Patients' };

// Placeholder until M8 (table, search, filters, edit, delete).
export default function PatientsPage() {
  return (
    <>
      <PageHeader
        title="Patients"
        description="Search and filter all patients by condition, severity, status and admission date."
      />
      <EmptyState
        icon={UsersIcon}
        title="Patient list coming next"
        description="Search, filters, pagination and editing will appear here."
      />
    </>
  );
}
