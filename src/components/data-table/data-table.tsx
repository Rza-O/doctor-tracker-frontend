'use client';

import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

export type Column<T> = {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  /** Backend sort field; makes the header a sort button. */
  sortKey?: string;
  /** Direction applied on the first click (dates usually start newest-first). */
  sortFirst?: 'asc' | 'desc';
  /** Applied to both the header and the cells (alignment, width). */
  className?: string;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[] | undefined;
  getRowId: (row: T) => string;
  /** Accessible name for the table (screen readers). */
  caption: string;
  /** First load with nothing to show yet → skeleton rows. */
  isLoading: boolean;
  /** Background refetch (e.g. next page) → keep rows, dim them slightly. */
  isFetching?: boolean;
  /** Current sort, e.g. "-admissionDate". */
  sort?: string;
  onSortChange?: (sort: string) => void;
  onRowClick?: (row: T) => void;
  /** Phone layout: each row as a stacked card instead of a wide table row. */
  renderCard: (row: T) => ReactNode;
  /** Shown when the request succeeded but returned no rows. */
  empty: ReactNode;
  skeletonRows?: number;
};

/**
 * Presentational table for server-driven lists. Sorting and pagination happen
 * on the server and live in the URL; this component only renders rows and
 * reports clicks. Desktop gets a table, phones get cards (CSS breakpoint, so
 * the server-rendered HTML is identical for every device — no hydration issues).
 */
export function DataTable<T>({
  columns,
  rows,
  getRowId,
  caption,
  isLoading,
  isFetching,
  sort,
  onSortChange,
  onRowClick,
  renderCard,
  empty,
  skeletonRows = 8,
}: DataTableProps<T>) {
  if (!isLoading && rows?.length === 0) return <>{empty}</>;

  const dim = isFetching && !isLoading ? 'opacity-60 transition-opacity' : 'transition-opacity';

  return (
    <div aria-busy={isLoading || isFetching}>
      {/* Desktop / tablet */}
      <div className={cn('hidden overflow-hidden rounded-xl border md:block', dim)}>
        <Table>
          <TableCaption className="sr-only">{caption}</TableCaption>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              {columns.map((col) => (
                <TableHead
                  key={col.id}
                  className={cn('h-10', col.className)}
                  aria-sort={ariaSort(sort, col.sortKey)}
                >
                  {col.sortKey && onSortChange ? (
                    <SortButton column={col} sort={sort} onSortChange={onSortChange} />
                  ) : (
                    col.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: skeletonRows }, (_, i) => (
                  <TableRow key={i} className="hover:bg-transparent">
                    {columns.map((col) => (
                      <TableCell key={col.id} className={col.className}>
                        <Skeleton className="h-4 w-full max-w-32" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : rows?.map((row) => (
                  <TableRow
                    key={getRowId(row)}
                    className={cn(onRowClick && 'cursor-pointer')}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {columns.map((col) => (
                      <TableCell key={col.id} className={cn('py-3', col.className)}>
                        {col.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* Phone */}
      <ul className={cn('flex flex-col gap-3 md:hidden', dim)} aria-label={caption}>
        {isLoading
          ? Array.from({ length: 4 }, (_, i) => (
              <li key={i}>
                <Skeleton className="h-28 w-full rounded-xl" />
              </li>
            ))
          : rows?.map((row) => <li key={getRowId(row)}>{renderCard(row)}</li>)}
      </ul>
    </div>
  );
}

function SortButton<T>({ column, sort, onSortChange }: { column: Column<T>; sort?: string; onSortChange: (s: string) => void }) {
  const key = column.sortKey!;
  const active = sort === key ? 'asc' : sort === `-${key}` ? 'desc' : null;

  const next = () => {
    if (active === 'asc') return `-${key}`;
    if (active === 'desc') return key;
    return column.sortFirst === 'desc' ? `-${key}` : key;
  };

  const Icon = active === 'asc' ? ArrowUpIcon : active === 'desc' ? ArrowDownIcon : ArrowUpDownIcon;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onSortChange(next());
      }}
      className={cn(
        '-ml-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-medium hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        active && 'text-foreground',
      )}
    >
      {column.header}
      <Icon className={cn('size-3.5', !active && 'text-muted-foreground/60')} aria-hidden />
    </button>
  );
}

function ariaSort(sort: string | undefined, key: string | undefined) {
  if (!key) return undefined;
  if (sort === key) return 'ascending' as const;
  if (sort === `-${key}`) return 'descending' as const;
  return 'none' as const;
}
