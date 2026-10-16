'use client';

import { addDays, endOfMonth, format, parseISO } from 'date-fns';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart';
import { formatNumber } from '@/lib/format';
import type { DashboardStats } from '../types';
import { ChartCard, DataTableView } from './chart-card';

type Series = DashboardStats['admissionsOverTime'];
type Point = Series['points'][number];

// One series (drawn in two styles) → no legend box; the card title names it.
const config = {
  total: { label: 'Admissions', color: 'var(--chart-accent)' },
  complete: { label: 'Admissions', color: 'var(--chart-accent)' },
  partial: { label: 'Admissions (in progress)', color: 'var(--chart-accent)' },
} satisfies ChartConfig;

const compact = new Intl.NumberFormat('en-US', { notation: 'compact' });

function tickLabel(bucket: string, unit: Series['unit']) {
  // Month buckets are "2026-10"; day/week buckets are "2026-10-04".
  return unit === 'month' ? format(parseISO(`${bucket}-01`), "MMM ''yy") : format(parseISO(bucket), 'MMM d');
}

function bucketRange(bucket: string, unit: Series['unit']) {
  if (unit === 'day') return format(parseISO(bucket), 'EEE, MMM d, yyyy');
  if (unit === 'week') {
    const start = parseISO(bucket);
    return `Week of ${format(start, 'MMM d')} – ${format(addDays(start, 6), 'MMM d, yyyy')}`;
  }
  const start = parseISO(`${bucket}-01`);
  return `${format(start, 'MMMM yyyy')} (${format(start, 'MMM d')}–${format(endOfMonth(start), 'd')})`;
}

/** Values lead, labels follow: the number is the strong element. */
type TooltipProps = { active?: boolean; payload?: ReadonlyArray<{ payload?: unknown }>; unit: Series['unit']; inProgress: string };

function AdmissionsTooltip({ active, payload, unit, inProgress }: TooltipProps) {
  const point = payload?.[0]?.payload as Point | undefined;
  if (!active || !point) return null;
  const share = point.total ? Math.round((point.critical / point.total) * 100) : 0;
  return (
    <div className="grid min-w-44 gap-1.5 rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="text-muted-foreground">
        {bucketRange(point.bucket, unit)}
        {point.bucket === inProgress && <span className="font-medium text-foreground"> · so far</span>}
      </p>
      <div className="flex items-center gap-2">
        <span className="h-0.5 w-3 rounded-full bg-(--color-total)" aria-hidden />
        <span className="text-sm font-semibold text-foreground">{formatNumber(point.total)}</span>
        <span className="text-muted-foreground">admissions</span>
      </div>
      <p className="text-muted-foreground">
        <span className="font-medium text-foreground">{formatNumber(point.critical)}</span> critical ({share}%)
      </p>
    </div>
  );
}

export function AdmissionsChart({ series, className }: { series: Series; className?: string }) {
  const { unit, points } = series;
  const current = { day: 'today', week: 'this week', month: 'this month' }[unit];

  // The last bucket (today / this week / this month) is still filling up, so a
  // solid line would show a fake "drop". Split the series: complete buckets are
  // solid; the segment into the in-progress bucket is dashed (= incomplete).
  const inProgress = points.at(-1)?.bucket ?? '';
  const data = points.map((p, i) => ({
    ...p,
    complete: i < points.length - 1 ? p.total : undefined,
    partial: i >= points.length - 2 ? p.total : undefined,
  }));

  return (
    <ChartCard
      className={className}
      title="Admissions over time"
      description={`Patients admitted per ${unit} · dashed = ${current}, still in progress`}
      chart={
        <ChartContainer config={config} className="aspect-auto h-64 w-full" aria-label="Admissions over time, area chart">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }} accessibilityLayer>
            <defs>
              {/* ~10% wash under the line, never a saturated block. */}
              <linearGradient id="admissions-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-total)" stopOpacity={0.18} />
                <stop offset="100%" stopColor="var(--color-total)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            {/* Recessive hairline grid: horizontal only, solid. */}
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="bucket"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
              tickFormatter={(b: string) => tickLabel(b, unit)}
              className="text-xs"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={44}
              allowDecimals={false}
              tickFormatter={(v: number) => compact.format(v)}
              className="text-xs tabular-nums"
            />
            <ChartTooltip
              cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1 }}
              content={({ active, payload }) => <AdmissionsTooltip active={active} payload={payload} unit={unit} inProgress={inProgress} />}
            />
            <Area
              dataKey="complete"
              type="monotone"
              stroke="var(--color-total)"
              strokeWidth={2}
              fill="url(#admissions-fill)"
              activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--card)' }}
              isAnimationActive={false}
            />
            <Area
              dataKey="partial"
              type="monotone"
              stroke="var(--color-total)"
              strokeWidth={2}
              strokeDasharray="4 4"
              fill="url(#admissions-fill)"
              fillOpacity={0.5}
              activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--card)' }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ChartContainer>
      }
      table={
        <DataTableView
          columns={[unit === 'month' ? 'Month' : unit === 'week' ? 'Week of' : 'Day', 'Admissions', 'Critical']}
          rows={points.map((p) => [tickLabel(p.bucket, unit), formatNumber(p.total), formatNumber(p.critical)])}
        />
      }
    />
  );
}
