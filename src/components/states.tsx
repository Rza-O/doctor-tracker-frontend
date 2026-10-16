'use client';

import { AlertTriangleIcon, RotateCwIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import { ApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';

type ErrorStateProps = {
  error: unknown;
  /** Usually React Query's `refetch`. */
  onRetry?: () => void;
  isRetrying?: boolean;
  title?: string;
  className?: string;
};

/** A failed request explained in plain words, with a way to try again. */
export function ErrorState({ error, onRetry, isRetrying, title = 'Something went wrong', className }: ErrorStateProps) {
  return (
    <Empty className={cn('border border-dashed border-destructive/30', className)} role="alert">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-destructive/10 text-destructive">
          <AlertTriangleIcon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{describeError(error)}</EmptyDescription>
      </EmptyHeader>
      {onRetry && (
        <EmptyContent>
          <Button variant="outline" onClick={onRetry} disabled={isRetrying}>
            {isRetrying ? <Spinner /> : <RotateCwIcon />}
            Try again
          </Button>
        </EmptyContent>
      )}
    </Empty>
  );
}

function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403) return "You don't have permission to view this.";
    if (error.status === 404) return 'This record no longer exists. It may have been deleted.';
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
}
