'use client';

import { ChevronDownIcon, FileTextIcon, ShieldAlertIcon, SparklesIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { ApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import type { IntakeResult } from '../api';
import { useAIEnabled, useIntake } from '../hooks';

// Fictional sample so reviewers can try the feature in one click.
const SAMPLE_NOTE = `Referral — Dhanmondi Medical Center
Dear colleague, I am referring Mrs. Sharmin Sultana, a 47-year-old woman, admitted yesterday with an acute asthma exacerbation. She needed nebulisers in the emergency room and is now on active treatment, moderate but improving.
Contact: +8801711223344, sharmin.sultana@example.com
Kind regards, Dr. Kamal Hossain (+8801999999999)`;

const LABELS: Record<string, string> = {
  name: 'name',
  age: 'age',
  gender: 'gender',
  phone: 'phone',
  email: 'email',
  condition: 'condition',
  severity: 'severity',
  status: 'status',
  admissionDate: 'admission date',
};

/**
 * "Fill from a referral note": the AI suggests field values, the form is
 * pre-filled, and the admin reviews everything before saving. Never submits.
 */
export function IntakePanel({ onExtract }: { onExtract: (fields: IntakeResult['fields']) => void }) {
  const enabled = useAIEnabled();
  const intake = useIntake();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');

  if (!enabled) return null;

  const extract = () =>
    intake.mutate(note, {
      onSuccess: (result) => onExtract(result.fields),
    });

  const result = intake.data;
  const filled = result ? Object.keys(result.fields).length : 0;
  const error = intake.error ? (intake.error instanceof ApiError ? intake.error.message : 'Extraction failed. Please try again.') : null;

  return (
    <div className="rounded-lg border bg-primary/5">
      <button
        type="button"
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <SparklesIcon className="size-4 text-primary" aria-hidden />
        Fill from a referral note
        <ChevronDownIcon className={cn('ml-auto size-4 text-muted-foreground transition-transform', open && 'rotate-180')} aria-hidden />
      </button>

      {open && (
        <div className="flex flex-col gap-3 border-t px-3 py-3">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Paste a referral or admission note…"
            rows={5}
            maxLength={4000}
            aria-label="Referral note"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" size="sm" onClick={extract} disabled={intake.isPending || note.trim().length < 20}>
              {intake.isPending ? <Spinner /> : <SparklesIcon />}
              {intake.isPending ? 'Reading note…' : 'Extract details'}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setNote(SAMPLE_NOTE)} disabled={intake.isPending}>
              <FileTextIcon /> Use sample note
            </Button>
          </div>
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <ShieldAlertIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            The note is sent to Google Gemini to extract details. Only paste notes you&apos;re allowed to share.
          </p>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          {result && !intake.isPending && (
            <div className="rounded-md bg-background px-3 py-2 text-sm" role="status" aria-live="polite">
              <p>
                <span className="font-medium">
                  Filled {filled} field{filled === 1 ? '' : 's'}
                </span>{' '}
                — marked with <SparklesIcon className="inline size-3.5 text-primary" aria-label="AI" />. Review them before saving.
              </p>
              {result.missing.length > 0 && (
                <p className="mt-1 text-muted-foreground">Not in the note: {result.missing.map((m) => LABELS[m] ?? m).join(', ')}.</p>
              )}
              {result.warnings.length > 0 && (
                <ul className="mt-1 list-disc pl-5 text-xs text-muted-foreground">
                  {result.warnings.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
