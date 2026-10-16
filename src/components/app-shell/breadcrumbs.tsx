'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, Fragment, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const STATIC_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  doctors: 'Doctors',
  patients: 'Patients',
};

// Dynamic segments (e.g. a doctor's id) only get a human label once the page
// has loaded the record, so pages register it here: useBreadcrumbLabel(id, name).
type Labels = Record<string, string>;
const BreadcrumbLabelsContext = createContext<{ setLabel: (segment: string, label: string) => void; labels: Labels } | null>(
  null,
);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [labels, setLabels] = useState<Labels>({});
  const setLabel = (segment: string, label: string) =>
    setLabels((prev) => (prev[segment] === label ? prev : { ...prev, [segment]: label }));
  return <BreadcrumbLabelsContext value={{ labels, setLabel }}>{children}</BreadcrumbLabelsContext>;
}

/** Called by detail pages to replace an id in the breadcrumb with a name. */
export function useBreadcrumbLabel(segment: string, label: string | undefined) {
  const ctx = useContext(BreadcrumbLabelsContext);
  const setLabel = ctx?.setLabel;
  useEffect(() => {
    if (label && setLabel) setLabel(segment, label);
  }, [segment, label, setLabel]);
}

export function AppBreadcrumbs() {
  const pathname = usePathname();
  const labels = useContext(BreadcrumbLabelsContext)?.labels ?? {};
  const segments = pathname.split('/').filter(Boolean);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, i) => {
          const href = '/' + segments.slice(0, i + 1).join('/');
          const label = STATIC_LABELS[segment] ?? labels[segment] ?? 'Details';
          const isLast = i === segments.length - 1;
          return (
            <Fragment key={href}>
              {i > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="max-w-48 truncate">{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={href} />}>{label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
