import { XIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

/** Row of search + filters above a table, with "Reset" when anything is active. */
export function DataTableToolbar({ children, isFiltered, onReset }: { children: ReactNode; isFiltered: boolean; onReset: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2 pb-4" role="search">
      {children}
      {isFiltered && (
        <Button variant="ghost" size="sm" className="h-8" onClick={onReset}>
          Reset
          <XIcon />
        </Button>
      )}
    </div>
  );
}
