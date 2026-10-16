'use client';

import { BarChart3Icon, TableIcon } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

type ChartCardProps = {
  title: string;
  description?: ReactNode;
  chart: ReactNode;
  /** Same data as a table — the accessible twin of every chart. */
  table: ReactNode;
  className?: string;
};

/**
 * Card shell for every dashboard chart, with a Chart / Table switch. The table
 * view means no value is ever reachable only by hovering, and it's the
 * screen-reader-friendly version of the chart.
 */
export function ChartCard({ title, description, chart, table, className }: ChartCardProps) {
  const [view, setView] = useState<'chart' | 'table'>('chart');

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        <CardAction>
          <ToggleGroup
            size="sm"
            className="rounded-lg bg-muted p-0.5"
            value={[view]}
            onValueChange={(v) => v[0] && setView(v[0] as 'chart' | 'table')}
            aria-label={`${title} view`}
          >
            <ToggleGroupItem
              value="chart"
              aria-label="Chart view"
              className="size-7 rounded-md text-muted-foreground aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-sm"
            >
              <BarChart3Icon />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="table"
              aria-label="Table view"
              className="size-7 rounded-md text-muted-foreground aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-sm"
            >
              <TableIcon />
            </ToggleGroupItem>
          </ToggleGroup>
        </CardAction>
      </CardHeader>
      <CardContent>{view === 'chart' ? chart : table}</CardContent>
    </Card>
  );
}

/** Compact, consistent table for chart data. */
export function DataTableView({ columns, rows }: { columns: string[]; rows: ReactNode[][] }) {
  return (
    <div className="max-h-72 overflow-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-muted">
          <tr>
            {columns.map((c, i) => (
              <th key={c} scope="col" className={`px-3 py-2 font-medium text-muted-foreground ${i === 0 ? 'text-left' : 'text-right'}`}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r} className="border-t">
              {row.map((cell, i) => (
                <td key={i} className={`px-3 py-1.5 ${i === 0 ? 'text-left' : 'text-right tabular-nums'}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
