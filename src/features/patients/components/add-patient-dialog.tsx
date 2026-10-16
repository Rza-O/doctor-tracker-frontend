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

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      form.reset(emptyValues());
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
        <form id="add-patient-form" onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          <PatientFormFields control={form.control} idPrefix="add-patient" />
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
