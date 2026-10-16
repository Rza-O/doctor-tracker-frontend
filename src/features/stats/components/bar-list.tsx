'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatNumber } from '@/lib/format';

export type BarItem = {
  key: string;
  label: string;
  value: number;
  /** Optional drill-down link (e.g. the doctor's page). */
  href?: string;
  /** Muted context after the label (e.g. "Cardiology", "17 doctors"). */
  detail?: ReactNode;
};

/**
 * Ranked horizontal bars for nominal categories. One series → one color for
 * every bar (coloring by value would just repeat the bar length). Bars grow
 * from a shared zero baseline, are ≤ 20px thick with a rounded data-end and a
 * square base, and carry their value at the tip. Each bar is focusable with a
 * tooltip showing its share of the total.
 */
export function BarList({ items, total, unit, label }: { items: BarItem[]; total: number; unit: string; label: string }) {
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <ul className="flex flex-col gap-2.5" aria-label={label}>
      {items.map((item) => {
        const share = total ? Math.round((item.value / total) * 1000) / 10 : 0;
        return (
          <li key={item.key} className="grid grid-cols-[minmax(0,10rem)_1fr] items-center gap-3 sm:grid-cols-[minmax(0,12rem)_1fr]">
            <div className="min-w-0 text-sm">
              {item.href ? (
                <Link href={item.href} className="block truncate font-medium hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span className="block truncate font-medium">{item.label}</span>
              )}
              {item.detail && <span className="block truncate text-xs text-muted-foreground">{item.detail}</span>}
            </div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <div
                      tabIndex={0}
                      aria-label={`${item.label}: ${formatNumber(item.value)} ${unit}`}
                      className="h-5 rounded-r-[4px] bg-(--chart-accent) outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
                      style={{ width: `${(item.value / max) * 100}%`, minWidth: 2 }}
                    />
                  }
                />
                <TooltipContent>
                  <span className="font-semibold">{formatNumber(item.value)}</span> {unit} · {share}% of the period
                </TooltipContent>
              </Tooltip>
              {/* Value at the bar tip, in text ink — never in the series color. */}
              <span className="shrink-0 text-xs font-medium tabular-nums">{formatNumber(item.value)}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
