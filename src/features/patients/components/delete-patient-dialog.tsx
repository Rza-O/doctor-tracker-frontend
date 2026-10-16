'use client';

import { Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Spinner } from '@/components/ui/spinner';
import { ApiError } from '@/lib/api-client';
import { useDeletePatient } from '../hooks';
import type { Patient } from '../types';

type Props = {
  /** Patient to delete; null = dialog closed. */
  patient: Pick<Patient, '_id' | 'name'> | null;
  onClose: () => void;
  onDeleted?: () => void;
};

/** "Are you sure?" step before a destructive, irreversible action. */
export function DeletePatientDialog({ patient, onClose, onDeleted }: Props) {
  const deletePatient = useDeletePatient();

  const confirm = () => {
    if (!patient) return;
    deletePatient.mutate(patient._id, {
      onSuccess: () => {
        toast.success(`${patient.name} was deleted`);
        onDeleted?.();
      },
      onError: (error) => {
        // The optimistic removal was rolled back — say why.
        toast.error(error instanceof ApiError ? error.message : 'Could not delete the patient');
      },
    });
    // Close immediately: the row is already gone (optimistic update).
    onClose();
  };

  return (
    <AlertDialog open={patient !== null} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete {patient?.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the patient and their record from their doctor&apos;s list. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={confirm} disabled={deletePatient.isPending}>
            {deletePatient.isPending && <Spinner />}
            Delete patient
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
