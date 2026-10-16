import { ArrowDownRightIcon, ArrowUpRightIcon, MinusIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type StatTileProps = {
  label: string;
  value: string;
  icon: ReactNode;
  /** Short context line under the value. */
  hint?: ReactNode;
  /** Signed change vs a named period. Neutral color: more admissions isn't simply "good" or "bad". */
  delta?: { pct: number | null; against: string };
  /** Status meaning (only for genuinely critical counts) — icon + label carry it, never color alone. */
  tone?: 'default' | 'critical';
};

/**
 * Stat tile: label · value · optional delta/hint. Values use the UI sans with
 * proportional figures (tabular digits look loose at display sizes) and text
 * colors only — the icon carries the accent, never the number itself.
 */
export function StatTile({ label, value, icon, hint, delta, tone = 'default' }: StatTileProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span
          className={cn(
            'flex size-8 items-center justify-center rounded-lg [&_svg]:size-4',
            tone === 'critical' ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-primary/10 text-primary',
          )}
          aria-hidden
        >
          {icon}
        </span>
      </div>
      <p className="text-3xl font-semibold tracking-tight">{value}</p>
      {delta ? <Delta {...delta} /> : hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function Delta({ pct, against }: { pct: number | null; against: string }) {
  if (pct === null) return <p className="text-xs text-muted-foreground">No data {against}</p>;
  const Icon = pct > 0 ? ArrowUpRightIcon : pct < 0 ? ArrowDownRightIcon : MinusIcon;
  return (
    <p className="flex items-center gap-1 text-xs text-muted-foreground">
      <Icon className="size-3.5" aria-hidden />
      <span className="font-medium text-foreground">
        {pct > 0 ? '+' : ''}
        {pct}%
      </span>
      {against}
    </p>
  );
}
