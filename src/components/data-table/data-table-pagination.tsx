'use client';

import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PAGE_SIZES } from '@/lib/url-schemas';

type PaginationProps = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

const number = new Intl.NumberFormat('en-US');

export function DataTablePagination({ page, limit, total, totalPages, onPageChange, onLimitChange }: PaginationProps) {
  if (total === 0) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const last = Math.max(totalPages, 1);

  return (
    <div className="flex flex-col-reverse items-center justify-between gap-3 pt-4 sm:flex-row">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Showing <span className="font-medium text-foreground">{number.format(from)}</span>–
        <span className="font-medium text-foreground">{number.format(to)}</span> of{' '}
        <span className="font-medium text-foreground">{number.format(total)}</span>
      </p>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-sm text-muted-foreground">Rows</span>
          <Select value={String(limit)} onValueChange={(value) => onLimitChange(Number(value))}>
            <SelectTrigger size="sm" className="w-18" aria-label="Rows per page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <nav className="flex items-center gap-1" aria-label="Pagination">
          <Button variant="outline" size="icon-sm" className="hidden sm:inline-flex" onClick={() => onPageChange(1)} disabled={page <= 1} aria-label="First page">
            <ChevronsLeftIcon />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1} aria-label="Previous page">
            <ChevronLeftIcon />
          </Button>
          <span className="min-w-24 px-2 text-center text-sm">
            Page <span className="font-medium">{page}</span> of {number.format(last)}
          </span>
          <Button variant="outline" size="icon-sm" onClick={() => onPageChange(page + 1)} disabled={page >= last} aria-label="Next page">
            <ChevronRightIcon />
          </Button>
          <Button variant="outline" size="icon-sm" className="hidden sm:inline-flex" onClick={() => onPageChange(last)} disabled={page >= last} aria-label="Last page">
            <ChevronsRightIcon />
          </Button>
        </nav>
      </div>
    </div>
  );
}
