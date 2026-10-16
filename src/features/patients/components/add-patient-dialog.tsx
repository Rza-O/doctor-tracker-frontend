'use client';

import { format } from 'date-fns';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import type { IntakeResult } from '@/features/ai/api';
import { IntakePanel } from '@/features/ai/components/intake-panel';
import { applyServerErrors } from '@/lib/form-errors';
import { zodResolver } from '@/lib/zod-resolver';
import { useCreatePatient } from '../hooks';
import { patientFormSchema, type PatientFormInput, type PatientFormValues } from '../schemas';
import { PatientFormFields } from './patient-form-fields';

const FIELDS = ['name', 'age', 'gender', 'phone', 'email', 'condition', 'severity', 'status', 'admissionDate'] as const;

// Sensible defaults for a new admission: stable, admitted, today.
const emptyValues = (): Partial<PatientFormInput> => ({
  name: '',
  age: '',
  phone: '',
  email: '',
  condition: '',
  severity: 'stable',
  status: 'admitted',
  admissionDate: format(new Date(), 'yyyy-MM-dd'),
});

export function AddPatientDialog({ doctorId, doctorName }: { doctorId: string; doctorName: string }) {
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const createPatient = useCreatePatient(doctorId);

  const form = useForm<PatientFormInput, unknown, PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: emptyValues(),
  });

  // Fields filled by smart intake keep a ✨ marker until the user edits them.
  // (setValue doesn't fire the inputs' onChange, so only real edits clear it.)
  const [aiFilled, setAiFilled] = useState<ReadonlySet<string>>(new Set());
  const markReviewed = (name: string) =>
    setAiFilled((prev) => {
      if (!prev.has(name)) return prev;
      const next = new Set(prev);
      next.delete(name);
      return next;
    });

  const applyIntake = (fields: IntakeResult['fields']) => {
    for (const [key, value] of Object.entries(fields)) {
      if (value === undefined) continue;
      // Pre-fill only — validation runs as usual and nothing is submitted.
      form.setValue(key as keyof PatientFormInput, String(value) as never, { shouldDirty: true, shouldValidate: true });
    }
    setAiFilled(new Set(Object.keys(fields)));
  };

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      form.reset(emptyValues());
      setAiFilled(new Set());
      setFormError(null);
      createPatient.reset();
    }
  };

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null);
    createPatient.mutate(values, {
      onSuccess: (patient) => {
        onOpenChange(false);
        toast.success(`${patient.name} added to Dr. ${doctorName}'s patients`);
      },
      onError: (error) => setFormError(applyServerErrors(form.setError, error, FIELDS)),
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button />}>
        <PlusIcon /> Add patient
      </DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add patient</DialogTitle>
          <DialogDescription>The patient will be assigned to Dr. {doctorName}.</DialogDescription>
        </DialogHeader>
        <IntakePanel onExtract={applyIntake} />
        <form id="add-patient-form" onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          <PatientFormFields control={form.control} idPrefix="add-patient" aiFilled={aiFilled} onUserEdit={markReviewed} />
          {formError && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
        </form>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button type="submit" form="add-patient-form" disabled={createPatient.isPending}>
            {createPatient.isPending && <Spinner />}
            {createPatient.isPending ? 'Adding…' : 'Add patient'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
