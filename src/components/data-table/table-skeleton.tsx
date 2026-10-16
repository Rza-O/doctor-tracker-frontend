import { Skeleton } from '@/components/ui/skeleton';

/** Suspense fallback for list pages (toolbar + table outline). */
export function TableSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy aria-label="Loading">
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-28" />
      </div>
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}
