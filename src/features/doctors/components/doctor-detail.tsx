'use client';

import { ArrowLeftIcon, Building2Icon, CalendarIcon, MailIcon, PhoneIcon, UsersIcon } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { ReactNode } from 'react';
import { useBreadcrumbLabel } from '@/components/app-shell/breadcrumbs';
import { ErrorState } from '@/components/states';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminOnly } from '@/features/auth/components/admin-only';
import { AddPatientDialog } from '@/features/patients/components/add-patient-dialog';
import { PatientsTable } from '@/features/patients/components/patients-table';
import { formatDate, formatNumber } from '@/lib/format';
import { useDoctor } from '../hooks';
import { DoctorAvatar } from './doctor-avatar';

export function DoctorDetail() {
  const { id } = useParams<{ id: string }>();
  const doctor = useDoctor(id);
  useBreadcrumbLabel(id, doctor.data ? `Dr. ${doctor.data.name}` : undefined);

  if (doctor.isPending) return <DoctorDetailSkeleton />;

  if (doctor.isError) {
    return (
      <div className="flex flex-col gap-4">
        <BackLink />
        <ErrorState error={doctor.error} onRetry={() => doctor.refetch()} isRetrying={doctor.isFetching} title="Couldn't load this doctor" />
      </div>
    );
  }

  const d = doctor.data;
  const addPatient = <AddPatientDialog doctorId={d._id} doctorName={d.name} />;

  return (
    <div className="flex flex-col gap-8">
      {/* React 19 hoists <title> into <head> from any component. */}
      <title>{`Dr. ${d.name} · Doctor Tracker`}</title>
      <BackLink />

      <section className="flex flex-col gap-6 rounded-xl border bg-card p-5 md:flex-row md:items-start md:justify-between md:p-6">
        <div className="flex items-start gap-4">
          <DoctorAvatar name={d.name} className="size-14 text-base" />
          <div className="min-w-0 space-y-2">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Dr. {d.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">{d.specialization}</Badge>
                <span className="flex items-center gap-1.5">
                  <Building2Icon className="size-3.5" aria-hidden /> {d.hospital}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
              <a href={`tel:${d.phone}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                <PhoneIcon className="size-3.5" aria-hidden /> {d.phone}
              </a>
              <a href={`mailto:${d.email}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                <MailIcon className="size-3.5" aria-hidden /> {d.email}
              </a>
            </div>
          </div>
        </div>

        <dl className="grid shrink-0 grid-cols-2 gap-3 sm:w-80">
          <Stat icon={<UsersIcon />} label="Patients" value={formatNumber(d.patientCount)} />
          <Stat icon={<CalendarIcon />} label="Joined" value={formatDate(d.createdAt)} />
        </dl>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Patients</h2>
            <p className="text-sm text-muted-foreground">Everyone under Dr. {d.name.split(' ')[0]}&apos;s care. Open a row to view or edit.</p>
          </div>
          <AdminOnly>{addPatient}</AdminOnly>
        </div>
        <PatientsTable doctorId={d._id} emptyAction={<AdminOnly>{addPatient}</AdminOnly>} />
      </section>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground [&_svg]:size-3.5">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 text-xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

function BackLink() {
  // Navigation is a link, not a button: a real <a> styled like a button keeps
  // the right semantics for screen readers (Base UI's Button would add role="button").
  return (
    <Link href="/doctors" className={buttonVariants({ variant: 'ghost', size: 'sm', className: '-ml-2 self-start' })}>
      <ArrowLeftIcon /> All doctors
    </Link>
  );
}

function DoctorDetailSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy aria-label="Loading doctor">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-36 w-full rounded-xl" />
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}
