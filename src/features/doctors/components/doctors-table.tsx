'use client';

import { Building2Icon, SearchXIcon, StethoscopeIcon, UsersIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { DataTable, type Column } from '@/components/data-table/data-table';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { DateRangeFilter } from '@/components/data-table/date-range-filter';
import { FacetedFilter } from '@/components/data-table/faceted-filter';
import { SearchInput } from '@/components/data-table/search-input';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/states';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useListParams } from '@/hooks/use-list-params';
import { formatDate, formatNumber } from '@/lib/format';
import { toOptions, useMeta } from '@/features/meta/hooks';
import { useDoctors } from '../hooks';
import type { Doctor } from '../types';
import { doctorsUrlSchema } from '../url-schema';
import { DoctorAvatar } from './doctor-avatar';

const columns: Column<Doctor>[] = [
  {
    id: 'doctor',
    header: 'Doctor',
    sortKey: 'name',
    cell: (d) => (
      <div className="flex min-w-0 items-center gap-3">
        <DoctorAvatar name={d.name} />
        <div className="min-w-0">
          {/* A real link: keyboard- and middle-click-friendly, the row click is a bonus. */}
          <Link
            href={`/doctors/${d._id}`}
            className="block truncate font-medium hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Dr. {d.name}
          </Link>
          <p className="truncate text-xs text-muted-foreground">{d.email}</p>
        </div>
      </div>
    ),
  },
  {
    id: 'specialization',
    header: 'Specialization',
    cell: (d) => <Badge variant="secondary">{d.specialization}</Badge>,
  },
  {
    id: 'hospital',
    header: 'Hospital',
    className: 'hidden lg:table-cell',
    cell: (d) => <span className="text-muted-foreground">{d.hospital}</span>,
  },
  {
    id: 'patients',
    header: 'Patients',
    className: 'text-right',
    cell: (d) => <span className="font-medium tabular-nums">{formatNumber(d.patientCount)}</span>,
  },
  {
    id: 'joined',
    header: 'Joined',
    sortKey: 'createdAt',
    sortFirst: 'desc',
    className: 'text-right',
    cell: (d) => <span className="text-muted-foreground tabular-nums">{formatDate(d.createdAt)}</span>,
  },
];

function DoctorCard({ doctor: d }: { doctor: Doctor }) {
  return (
    <Link href={`/doctors/${d._id}`} className="flex flex-col gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50">
      <div className="flex items-center gap-3">
        <DoctorAvatar name={d.name} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">Dr. {d.name}</p>
          <p className="truncate text-xs text-muted-foreground">{d.email}</p>
        </div>
        <Badge variant="secondary">{d.specialization}</Badge>
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span className="flex min-w-0 items-center gap-1.5 truncate">
          <Building2Icon className="size-3.5 shrink-0" aria-hidden /> {d.hospital}
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          <UsersIcon className="size-3.5" aria-hidden /> {formatNumber(d.patientCount)}
        </span>
      </div>
    </Link>
  );
}

export function DoctorsTable() {
  const router = useRouter();
  const { params, setParams, clearParams } = useListParams(doctorsUrlSchema);
  const meta = useMeta();

  // Drop filter values the backend doesn't know (e.g. an old shared link), once
  // the valid lists are loaded — so a stale URL can't cause a 400.
  const query = useMemo(() => {
    const known = (values: string[], allowed?: string[]) => (allowed ? values.filter((v) => allowed.includes(v)) : values);
    return {
      ...params,
      specialization: known(params.specialization, meta.data?.specializations),
      hospital: known(params.hospital, meta.data?.hospitals),
    };
  }, [params, meta.data]);

  const doctors = useDoctors(query);
  const isFiltered = Boolean(query.search || query.specialization.length || query.hospital.length || query.from || query.to);

  return (
    <div>
      <DataTableToolbar isFiltered={isFiltered} onReset={() => clearParams()}>
        <SearchInput
          value={query.search}
          onChange={(search) => setParams({ search }, { history: 'replace' })}
          placeholder="Search doctors by name…"
        />
        <FacetedFilter
          title="Specialization"
          options={toOptions(meta.data?.specializations)}
          selected={query.specialization}
          onChange={(specialization) => setParams({ specialization })}
        />
        <FacetedFilter
          title="Hospital"
          options={toOptions(meta.data?.hospitals)}
          selected={query.hospital}
          onChange={(hospital) => setParams({ hospital })}
        />
        <DateRangeFilter title="Joined" from={query.from} to={query.to} onChange={({ from, to }) => setParams({ from, to })} />
      </DataTableToolbar>

      {doctors.isError && !doctors.data ? (
        <ErrorState error={doctors.error} onRetry={() => doctors.refetch()} isRetrying={doctors.isFetching} />
      ) : (
        <>
          <DataTable
            caption="Doctors"
            columns={columns}
            rows={doctors.data?.items}
            getRowId={(d) => d._id}
            isLoading={doctors.isPending}
            isFetching={doctors.isPlaceholderData}
            sort={query.sort}
            onSortChange={(sort) => setParams({ sort })}
            onRowClick={(d) => router.push(`/doctors/${d._id}`)}
            renderCard={(d) => <DoctorCard doctor={d} />}
            empty={
              isFiltered ? (
                <EmptyState
                  icon={SearchXIcon}
                  title="No doctors match your filters"
                  description="Try a different name or remove some filters."
                  action={
                    <Button variant="outline" onClick={() => clearParams()}>
                      Reset filters
                    </Button>
                  }
                />
              ) : (
                <EmptyState icon={StethoscopeIcon} title="No doctors yet" description="Doctors you add will appear here." />
              )
            }
          />
          {doctors.data && (
            <DataTablePagination
              page={doctors.data.page}
              limit={doctors.data.limit}
              total={doctors.data.total}
              totalPages={doctors.data.totalPages}
              onPageChange={(page) => setParams({ page })}
              onLimitChange={(limit) => setParams({ limit })}
            />
          )}
        </>
      )}
    </div>
  );
}
