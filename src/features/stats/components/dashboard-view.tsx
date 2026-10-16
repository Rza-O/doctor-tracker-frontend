'use client';

import { format, formatDistanceStrict, parseISO, subMonths } from 'date-fns';
import { ActivityIcon, CalendarPlusIcon, HeartPulseIcon, StethoscopeIcon, TriangleAlertIcon, UsersIcon } from 'lucide-react';
import { ErrorState } from '@/components/states';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useListParams } from '@/hooks/use-list-params';
import { useNow } from '@/hooks/use-now';
import { formatDate, formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useStats } from '../hooks';
import type { DashboardStats } from '../types';
import { RANGES, statsUrlSchema } from '../url-schema';
import { AdmissionsChart } from './admissions-chart';
import { ConditionBreakdown, SpecialtyBreakdown, TopDoctors } from './breakdowns';
import { PatientMix } from './patient-mix';
import { StatTile } from './stat-tile';

const pct = (part: number, whole: number) => (whole ? `${Math.round((part / whole) * 100)}%` : '—');

export function DashboardView() {
  const { params, setParams } = useListParams(statsUrlSchema);
  const stats = useStats(params.range);

  if (stats.isPending) return <DashboardSkeleton />;
  if (stats.isError && !stats.data) {
    return <ErrorState error={stats.error} onRetry={() => stats.refetch()} isRetrying={stats.isFetching} title="Couldn't load the dashboard" />;
  }

  const s = stats.data;
  // While a new period loads, the previous numbers stay visible but dimmed.
  const refreshing = stats.isPlaceholderData;

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="snapshot-heading" className="flex flex-col gap-3">
        <h2 id="snapshot-heading" className="text-sm font-medium text-muted-foreground">
          Snapshot · all time
        </h2>
        <KpiTiles kpis={s.kpis} generatedAt={s.generatedAt} />
      </section>

      <section aria-labelledby="period-heading" className="flex flex-col gap-4">
        {/* One filter row above everything it scopes. */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="period-heading" className="text-lg font-semibold tracking-tight">
              Admissions & patient mix
            </h2>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{formatNumber(s.period.admissions)}</span> patients admitted since{' '}
              {formatDate(s.period.from)} · <UpdatedAgo generatedAt={s.generatedAt} />
            </p>
          </div>
          {/* Segmented control: muted track, the selected period raised on the surface. */}
          <ToggleGroup
            size="sm"
            className="self-start rounded-lg bg-muted p-0.5 sm:self-auto"
            value={[params.range]}
            // Single choice: ignore "deselect" (empty array) so a period is always active.
            // (The URL schema validates the value, so a plain string is safe here.)
            onValueChange={(value) => value[0] && setParams({ range: value[0] }, { resetPage: false })}
            aria-label="Period"
          >
            {RANGES.map((r) => (
              <ToggleGroupItem
                key={r.value}
                value={r.value}
                aria-label={r.label}
                className="h-7 rounded-md px-3 text-muted-foreground aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-sm"
              >
                {r.short}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className={cn('grid gap-4 transition-opacity lg:grid-cols-3', refreshing && 'opacity-60')} aria-busy={refreshing}>
          <AdmissionsChart series={s.admissionsOverTime} className="lg:col-span-2" />
          <PatientMix stats={s} />
          <TopDoctors stats={s} className="lg:col-span-2" />
          <ConditionBreakdown stats={s} />
          <SpecialtyBreakdown stats={s} className="lg:col-span-3" />
        </div>
      </section>
    </div>
  );
}

function KpiTiles({ kpis: k, generatedAt }: { kpis: DashboardStats['kpis']; generatedAt: string }) {
  // "vs Sep 1–17": the comparison window spelled out (same days of last month).
  const asOf = parseISO(generatedAt);
  const comparedTo = `vs ${format(subMonths(asOf, 1), 'MMM')} 1–${format(asOf, 'd')}`;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      <StatTile label="Patients" value={formatNumber(k.totalPatients)} icon={<UsersIcon />} hint="All patient records" />
      <StatTile
        label="Doctors"
        value={formatNumber(k.totalDoctors)}
        icon={<StethoscopeIcon />}
        hint={`≈${Math.round(k.avgPatientsPerDoctor)} patients each`}
      />
      <StatTile
        label="In care"
        value={formatNumber(k.inCare)}
        icon={<HeartPulseIcon />}
        hint={`${pct(k.inCare, k.totalPatients)} admitted or under treatment`}
      />
      <StatTile
        label="Critical"
        value={formatNumber(k.critical)}
        icon={<TriangleAlertIcon />}
        tone="critical"
        hint={`${pct(k.critical, k.totalPatients)} of all patients`}
      />
      <div className="col-span-2 lg:col-span-1">
        <StatTile
          label="New this month"
          value={formatNumber(k.newThisMonth)}
          icon={<CalendarPlusIcon />}
          delta={{ pct: k.monthOverMonthChangePct, against: comparedTo }}
        />
      </div>
    </div>
  );
}

function UpdatedAgo({ generatedAt }: { generatedAt: string }) {
  const now = useNow();
  // Before hydration (now = 0) render a neutral label instead of a guess.
  if (!now) return <span>updated recently</span>;
  // `now` is rounded down to the tick, so it can be a few seconds *before* the
  // server's timestamp — clamp, or the label would read "updated in 7 seconds".
  const generated = parseISO(generatedAt);
  const ageMs = now - generated.getTime();
  return (
    <span title="Statistics are cached for up to 60 seconds">
      <ActivityIcon className="mr-1 inline size-3 align-[-1px]" aria-hidden />
      {ageMs < 15_000 ? 'updated just now' : `updated ${formatDistanceStrict(generated, now, { addSuffix: true })}`}
    </span>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy aria-label="Loading dashboard">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className={cn('h-32 rounded-xl', i === 4 && 'col-span-2 lg:col-span-1')} />
        ))}
      </div>
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-80 w-full rounded-xl" />
    </div>
  );
}
