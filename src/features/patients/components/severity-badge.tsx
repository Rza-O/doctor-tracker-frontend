import { cn } from '@/lib/utils';
import { SEVERITY, STATUS } from '../constants';
import type { PatientStatus, Severity } from '../types';

export function SeverityBadge({ severity }: { severity: Severity }) {
  const s = SEVERITY[severity];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset', s.className)}>
      <span className={cn('size-1.5 rounded-full', s.dot)} aria-hidden />
      {s.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: PatientStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
        status === 'discharged' ? 'text-muted-foreground' : 'text-foreground',
      )}
    >
      {STATUS[status]}
    </span>
  );
}
