'use client';

import { formatDistanceStrict, parseISO } from 'date-fns';
import { PieChartIcon, RotateCwIcon, ShieldCheckIcon, SparklesIcon, StethoscopeIcon, TrendingUpIcon, TriangleAlertIcon, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { useNow } from '@/hooks/use-now';
import { ApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import type { Insight } from '../api';
import { useAIEnabled, useInsights, useRegenerateInsights } from '../hooks';

const KIND: Record<Insight['kind'], { icon: LucideIcon; label: string; tone: string }> = {
  trend: { icon: TrendingUpIcon, label: 'Trend', tone: 'bg-primary/10 text-primary' },
  // Risk carries status meaning → status color on the icon, plus a text label.
  risk: { icon: TriangleAlertIcon, label: 'Risk', tone: 'bg-red-500/10 text-red-600 dark:text-red-400' },
  workload: { icon: StethoscopeIcon, label: 'Workload', tone: 'bg-primary/10 text-primary' },
  mix: { icon: PieChartIcon, label: 'Patient mix', tone: 'bg-primary/10 text-primary' },
};

/** "just now" under 15 s (the clock tick is rounded down), else "3 minutes ago". */
function relativeTime(iso: string, now: number) {
  const at = parseISO(iso);
  return now - at.getTime() < 15_000 ? 'generated just now' : `generated ${formatDistanceStrict(at, now, { addSuffix: true })}`;
}

/**
 * AI insights for the selected period, generated from aggregated statistics
 * only and number-checked on the server. Hidden when the server has no AI.
 */
export function InsightsCard({ range, periodLabel, className }: { range: string; periodLabel: string; className?: string }) {
  const enabled = useAIEnabled();
  const insights = useInsights(range, enabled);
  const regenerate = useRegenerateInsights(range);
  const now = useNow();

  if (!enabled) return null;

  const data = insights.data;
  const busy = insights.isFetching || regenerate.isPending;
  const error = regenerate.error ?? (insights.isError && !data ? insights.error : null);

  return (
    <Card className={className} aria-busy={busy}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SparklesIcon className="size-4 text-primary" aria-hidden />
          AI insights
        </CardTitle>
        <CardDescription>{periodLabel} · written from aggregated statistics only</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm" onClick={() => regenerate.mutate()} disabled={busy}>
            {regenerate.isPending ? <Spinner /> : <RotateCwIcon />}
            Regenerate
          </Button>
        </CardAction>
      </CardHeader>

      {/* min height ≈ the loaded content, so the charts below don't jump when insights arrive. */}
      <CardContent className="min-h-36">
        {error ? (
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground" role="alert">
            {error instanceof ApiError ? error.message : 'Insights are unavailable right now.'}
            <Button variant="outline" size="sm" onClick={() => (regenerate.error ? regenerate.mutate() : insights.refetch())}>
              Try again
            </Button>
          </div>
        ) : !data ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Generating insights">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="size-8 shrink-0 rounded-lg" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : data.insights.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reliable insights for this period — try Regenerate.</p>
        ) : (
          <ul className={cn('grid gap-x-6 gap-y-5 transition-opacity sm:grid-cols-2 lg:grid-cols-4', regenerate.isPending && 'opacity-60')}>
            {data.insights.map((insight, i) => {
              const kind = KIND[insight.kind] ?? KIND.trend;
              return (
                <li key={`${insight.kind}-${i}`} className="flex gap-3">
                  <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg [&_svg]:size-4', kind.tone)} aria-hidden>
                    <kind.icon />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{kind.label}</p>
                    <p className="mt-0.5 text-sm font-medium text-balance">{insight.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{insight.detail}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>

      {data && !error && (
        <CardFooter className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <ShieldCheckIcon className="size-3.5" aria-hidden />
          AI-generated · every number is checked against the data before it&apos;s shown · no patient records are sent
          {now > 0 && <span>· {relativeTime(data.generatedAt, now)}</span>}
        </CardFooter>
      )}
    </Card>
  );
}
