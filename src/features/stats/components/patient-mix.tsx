'use client';

import { CircleAlertIcon, CircleCheckIcon, TriangleAlertIcon, type LucideIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { DashboardStats, KeyCount } from '../types';
import { ChartCard, DataTableView } from './chart-card';

type Segment = {
  key: string;
  label: string;
  count: number;
  color: string;
  /** Text color for a label drawn INSIDE the fill (picked by the fill's luminance). */
  onFill: string;
  icon?: LucideIcon;
};

// Severity = status meaning → status tokens, each with an icon + label.
const SEVERITY: Record<string, Omit<Segment, 'key' | 'count'>> = {
  // In-fill label colors are computed, not guessed: white on this green is only
  // 3.35:1 (fails for small text), ink is 5.90:1.
  stable: { label: 'Stable', color: 'var(--status-good)', onFill: 'text-neutral-950', icon: CircleCheckIcon },
  moderate: { label: 'Moderate', color: 'var(--status-warning)', onFill: 'text-neutral-950', icon: CircleAlertIcon },
  critical: { label: 'Critical', color: 'var(--status-critical)', onFill: 'text-white', icon: TriangleAlertIcon },
};

// Lifecycle = ordinal → one hue in steps (see globals.css).
const STATUS: Record<string, Omit<Segment, 'key' | 'count'>> = {
  admitted: { label: 'Admitted', color: 'var(--mix-admitted)', onFill: 'text-white dark:text-neutral-950' },
  'under-treatment': { label: 'Under treatment', color: 'var(--mix-treatment)', onFill: 'text-white dark:text-neutral-950' },
  discharged: { label: 'Discharged', color: 'var(--mix-discharged)', onFill: 'text-neutral-950 dark:text-white' },
};

const toSegments = (rows: KeyCount[], meta: typeof SEVERITY) =>
  rows.map((r) => ({ key: r.key, count: r.count, ...meta[r.key]! }));

const percent = (count: number, total: number) => (total ? Math.round((count / total) * 100) : 0);

/**
 * One 100% stacked bar: part-to-whole with ≤ 3 parts. 2px surface gaps between
 * segments, rounded outer ends, a % label inside only when it fits, every
 * segment focusable with a tooltip, and a legend with counts below.
 */
function StackedBar({ title, segments }: { title: string; segments: Segment[] }) {
  const total = segments.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-sm font-medium">{title}</p>
      <div className="flex h-7 w-full gap-0.5 overflow-hidden rounded-md" role="img" aria-label={`${title}: ${segments.map((s) => `${s.label} ${percent(s.count, total)}%`).join(', ')}`}>
        {segments
          .filter((s) => s.count > 0)
          .map((s) => {
            const pct = percent(s.count, total);
            return (
              <Tooltip key={s.key}>
                <TooltipTrigger
                  render={
                    <div
                      tabIndex={0}
                      className={cn(
                        'flex h-full min-w-1 items-center justify-center text-xs font-semibold outline-none transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-ring',
                        s.onFill,
                      )}
                      style={{ width: `${(s.count / total) * 100}%`, backgroundColor: s.color }}
                    />
                  }
                >
                  {/* Label only when the segment is wide enough; otherwise the legend and tooltip carry it. */}
                  {pct >= 12 ? `${pct}%` : null}
                </TooltipTrigger>
                <TooltipContent>
                  <span className="font-semibold">{formatNumber(s.count)}</span> {s.label.toLowerCase()} ({pct}%)
                </TooltipContent>
              </Tooltip>
            );
          })}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {segments.map((s) => (
          <li key={s.key} className="flex items-center gap-1.5 text-muted-foreground">
            {s.icon ? (
              <s.icon className="size-3.5" style={{ color: s.color }} aria-hidden />
            ) : (
              <span className="size-2.5 rounded-sm" style={{ backgroundColor: s.color }} aria-hidden />
            )}
            <span className="text-foreground">{s.label}</span>
            <span className="tabular-nums">
              {formatNumber(s.count)} · {percent(s.count, total)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PatientMix({ stats, className }: { stats: Pick<DashboardStats, 'bySeverity' | 'byStatus'>; className?: string }) {
  const severity = toSegments(stats.bySeverity, SEVERITY);
  const status = toSegments(stats.byStatus, STATUS);
  const total = severity.reduce((s, x) => s + x.count, 0);

  return (
    <ChartCard
      className={className}
      title="Patient mix"
      description="Severity and care status of patients admitted in this period"
      chart={
        <div className="flex flex-col gap-6 pt-1">
          <StackedBar title="Severity" segments={severity} />
          <StackedBar title="Care status" segments={status} />
        </div>
      }
      table={
        <DataTableView
          columns={['Group', 'Patients', 'Share']}
          rows={[
            ...severity.map((s) => [`Severity · ${s.label}`, formatNumber(s.count), `${percent(s.count, total)}%`]),
            ...status.map((s) => [`Status · ${s.label}`, formatNumber(s.count), `${percent(s.count, total)}%`]),
          ]}
        />
      }
    />
  );
}
