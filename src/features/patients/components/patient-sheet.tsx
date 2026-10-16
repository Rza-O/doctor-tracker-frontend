'use client';

import { format, parseISO } from 'date-fns';
import { CalendarIcon, MailIcon, PhoneIcon, StethoscopeIcon, Trash2Icon } from 'lucide-react';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ErrorState } from '@/components/states';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { useIsAdmin } from '@/features/auth/hooks';
import { formatDate } from '@/lib/format';
import { applyServerErrors } from '@/lib/form-errors';
import { zodResolver } from '@/lib/zod-resolver';
import { GENDER } from '../constants';
import { usePatient, useUpdatePatient } from '../hooks';
import { patientFormSchema, type PatientFormInput, type PatientFormValues } from '../schemas';
import type { Patient, PatientInput } from '../types';
import { DeletePatientDialog } from './delete-patient-dialog';
import { PatientFormFields } from './patient-form-fields';
import { SeverityBadge, StatusBadge } from './severity-badge';

const FIELDS = ['name', 'age', 'gender', 'phone', 'email', 'condition', 'severity', 'status', 'admissionDate'] as const;

/**
 * Side panel for one patient. Everyone sees the details; admins get an edit
 * form and a delete action in the same place, without leaving the list.
 */
export function PatientSheet({ patientId, onClose }: { patientId: string | undefined; onClose: () => void }) {
  const patient = usePatient(patientId);
  const isAdmin = useIsAdmin();

  return (
    <Sheet open={Boolean(patientId)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
        {patient.data ? (
          <>
            <SheetHeader className="border-b">
              <SheetTitle className="text-lg">{patient.data.name}</SheetTitle>
              <SheetDescription className="flex flex-wrap items-center gap-2">
                <span>{patient.data.condition}</span>
                <SeverityBadge severity={patient.data.severity} />
                <StatusBadge status={patient.data.status} />
              </SheetDescription>
            </SheetHeader>
            <PatientSummary patient={patient.data} />
            {isAdmin && (
              // Keyed by id only: re-mounting on every save would unmount the
              // form mid-mutation, and React Query skips the success callback
              // (no toast). The form resets itself with saved values instead.
              <PatientEditForm key={patient.data._id} patient={patient.data} onDeleted={onClose} />
            )}
          </>
        ) : patient.isError ? (
          <div className="p-4">
            <SheetTitle className="sr-only">Patient</SheetTitle>
            <ErrorState error={patient.error} onRetry={() => patient.refetch()} isRetrying={patient.isFetching} />
          </div>
        ) : (
          <div className="flex flex-col gap-3 p-4" aria-busy>
            <SheetTitle className="sr-only">Loading patient</SheetTitle>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-5 w-64" />
            <Skeleton className="mt-4 h-40 w-full" />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function PatientSummary({ patient: p }: { patient: Patient }) {
  const row = (icon: ReactNode, label: string, value: ReactNode) => (
    <div className="flex items-start gap-3 text-sm">
      <span className="mt-0.5 text-muted-foreground [&_svg]:size-4">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="truncate">{value}</div>
      </div>
    </div>
  );

  return (
    <div className="grid gap-4 p-4 sm:grid-cols-2">
      {row(<StethoscopeIcon />, 'Doctor', (
        <Link href={`/doctors/${p.doctor._id}`} className="font-medium hover:underline">
          Dr. {p.doctor.name}
        </Link>
      ))}
      {row(<CalendarIcon />, 'Admitted', formatDate(p.admissionDate))}
      {row(<PhoneIcon />, 'Phone', p.phone)}
      {row(<MailIcon />, 'Email', p.email || <span className="text-muted-foreground">—</span>)}
      <p className="text-xs text-muted-foreground sm:col-span-2">
        {p.age} years · {GENDER[p.gender]} · last updated {formatDate(p.updatedAt)}
      </p>
    </div>
  );
}

function toFormValues(p: Patient): PatientFormInput {
  return {
    name: p.name,
    age: String(p.age),
    gender: p.gender,
    phone: p.phone,
    email: p.email ?? '',
    condition: p.condition,
    severity: p.severity,
    status: p.status,
    admissionDate: format(parseISO(p.admissionDate), 'yyyy-MM-dd'),
  };
}

function PatientEditForm({ patient, onDeleted }: { patient: Patient; onDeleted: () => void }) {
  const updatePatient = useUpdatePatient();
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const form = useForm<PatientFormInput, unknown, PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: toFormValues(patient),
  });

  const onSubmit = form.handleSubmit((values) => {
    // PATCH only what the user actually changed — never overwrite other fields
    // with possibly stale values from when the panel was opened.
    const dirty = form.formState.dirtyFields;
    const patch = Object.fromEntries(
      (Object.keys(dirty) as (keyof PatientFormValues)[]).filter((k) => dirty[k]).map((k) => [k, values[k]]),
    ) as Partial<PatientInput>;

    if (Object.keys(patch).length === 0) {
      toast.info('No changes to save');
      return;
    }

    setFormError(null);
    updatePatient.mutate(
      { id: patient._id, patch },
      {
        onSuccess: (updated) => {
          // New baseline: saved values become the defaults, so "dirty" tracking
          // and the Reset button start from what's actually stored now.
          form.reset(toFormValues(updated));
          toast.success(`${updated.name} updated`);
        },
        onError: (error) => setFormError(applyServerErrors(form.setError, error, FIELDS)),
      },
    );
  });

  return (
    <>
      <Separator />
      <form id="edit-patient-form" onSubmit={onSubmit} noValidate className="flex flex-col gap-4 p-4">
        <h3 className="text-sm font-medium">Edit details</h3>
        <PatientFormFields control={form.control} idPrefix="edit-patient" />
        {formError && (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
      </form>
      <SheetFooter className="sticky bottom-0 flex-row justify-between border-t bg-popover">
        <Button variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setConfirmDelete(true)}>
          <Trash2Icon /> Delete
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => form.reset()} disabled={!form.formState.isDirty || updatePatient.isPending}>
            Reset
          </Button>
          <Button type="submit" form="edit-patient-form" disabled={updatePatient.isPending}>
            {updatePatient.isPending && <Spinner />}
            Save changes
          </Button>
        </div>
      </SheetFooter>
      <DeletePatientDialog patient={confirmDelete ? patient : null} onClose={() => setConfirmDelete(false)} onConfirmed={onDeleted} />
    </>
  );
}
