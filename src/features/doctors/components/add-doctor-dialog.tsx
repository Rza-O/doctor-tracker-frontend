'use client';

import { PlusIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { useMeta } from '@/features/meta/hooks';
import { applyServerErrors } from '@/lib/form-errors';
import { zodResolver } from '@/lib/zod-resolver';
import { useCreateDoctor } from '../hooks';
import { doctorFormSchema, type DoctorFormInput, type DoctorFormValues } from '../schemas';

const EMPTY: DoctorFormInput = { name: '', specialization: '', hospital: '', phone: '', email: '' };
const FIELDS = ['name', 'specialization', 'hospital', 'phone', 'email'] as const;

export function AddDoctorDialog() {
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();
  const meta = useMeta();
  const createDoctor = useCreateDoctor();
  const hospitalListId = useId();

  const form = useForm<DoctorFormInput, unknown, DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: EMPTY,
  });

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      // Start fresh next time it opens.
      form.reset(EMPTY);
      setFormError(null);
      createDoctor.reset();
    }
  };

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null);
    createDoctor.mutate(values, {
      onSuccess: (doctor) => {
        onOpenChange(false);
        toast.success(`Dr. ${doctor.name} added`, {
          action: { label: 'View', onClick: () => router.push(`/doctors/${doctor._id}`) },
        });
      },
      onError: (error) => setFormError(applyServerErrors(form.setError, error, FIELDS)),
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button />}>
        <PlusIcon /> Add doctor
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add doctor</DialogTitle>
          <DialogDescription>New doctors appear in the list immediately and can be assigned patients.</DialogDescription>
        </DialogHeader>

        <form id="add-doctor-form" onSubmit={onSubmit} noValidate>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="doctor-name">Full name</FieldLabel>
                  <Input {...field} id="doctor-name" placeholder="Farhana Rahman" autoComplete="off" aria-invalid={fieldState.invalid} />
                  <FieldDescription>Without the &ldquo;Dr.&rdquo; title — it&apos;s added automatically.</FieldDescription>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="specialization"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="doctor-specialization">Specialization</FieldLabel>
                    <Select value={field.value || null} onValueChange={(value) => field.onChange(value ?? '')}>
                      <SelectTrigger id="doctor-specialization" className="w-full" aria-invalid={fieldState.invalid} onBlur={field.onBlur}>
                        <SelectValue placeholder="Select…" />
                      </SelectTrigger>
                      <SelectContent>
                        {meta.data?.specializations.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                name="hospital"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="doctor-hospital">Hospital</FieldLabel>
                    {/* Suggests existing hospitals but still allows a new one. */}
                    <Input {...field} id="doctor-hospital" list={hospitalListId} autoComplete="off" aria-invalid={fieldState.invalid} />
                    <datalist id={hospitalListId}>
                      {meta.data?.hospitals.map((h) => <option key={h} value={h} />)}
                    </datalist>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="phone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="doctor-phone">Phone</FieldLabel>
                    <Input {...field} id="doctor-phone" type="tel" placeholder="+8801711000000" autoComplete="off" aria-invalid={fieldState.invalid} />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="doctor-email">Email</FieldLabel>
                    <Input {...field} id="doctor-email" type="email" placeholder="name@hospital.com" autoComplete="off" aria-invalid={fieldState.invalid} />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>

            {formError && (
              <Alert variant="destructive" role="alert">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
          </FieldGroup>
        </form>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button type="submit" form="add-doctor-form" disabled={createDoctor.isPending}>
            {createDoctor.isPending && <Spinner />}
            {createDoctor.isPending ? 'Adding…' : 'Add doctor'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
