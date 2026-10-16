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
import { ApiError } from '@/lib/api-client';
import { useDeletePatient } from '../hooks';
import type { Patient } from '../types';

type Props = {
  /** Patient to delete; null = dialog closed. */
  patient: Pick<Patient, '_id' | 'name'> | null;
  onClose: () => void;
  /**
   * Runs as soon as the user confirms (the delete is optimistic, so the
   * patient is already gone from the UI) — e.g. to close a side panel.
   */
  onConfirmed?: () => void;
};

/** "Are you sure?" step before a destructive, irreversible action. */
export function DeletePatientDialog({ patient, onClose, onConfirmed }: Props) {
  const deletePatient = useDeletePatient();

  const confirm = async () => {
    if (!patient) return;
    onClose();
    onConfirmed?.();
    // mutateAsync, not mutate(…, { onSuccess }): this component may unmount
    // right away (its parent panel closes), and React Query skips mutate()
    // callbacks of unmounted components. A promise always settles.
    try {
      await deletePatient.mutateAsync(patient._id);
      toast.success(`${patient.name} was deleted`);
    } catch (error) {
      // The optimistic removal was rolled back — say why.
      toast.error(error instanceof ApiError ? error.message : 'Could not delete the patient');
    }
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
          <AlertDialogAction variant="destructive" onClick={confirm}>
            Delete patient
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
