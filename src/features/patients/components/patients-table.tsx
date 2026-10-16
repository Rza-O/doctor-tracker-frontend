'use client';

import { MoreHorizontalIcon, PencilIcon, SearchXIcon, Trash2Icon, UsersIcon, XIcon } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState, type ReactNode } from 'react';
import { DataTable, type Column } from '@/components/data-table/data-table';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { DateRangeFilter } from '@/components/data-table/date-range-filter';
import { FacetedFilter } from '@/components/data-table/faceted-filter';
import { SearchInput } from '@/components/data-table/search-input';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/states';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useIsAdmin } from '@/features/auth/hooks';
import { toOptions, useMeta } from '@/features/meta/hooks';
import { AskBar } from '@/features/ai/components/ask-bar';
import { ageLabel, describePatientFilters } from '@/features/ai/describe-filters';
import { useListParams } from '@/hooks/use-list-params';
import { formatDate } from '@/lib/format';
import { GENDER, SEVERITY, SEVERITY_VALUES, STATUS, STATUS_VALUES } from '../constants';
import { usePatients } from '../hooks';
import type { Patient } from '../types';
import { patientsUrlSchema } from '../url-schema';
import { DeletePatientDialog } from './delete-patient-dialog';
import { PatientSheet } from './patient-sheet';
import { SeverityBadge, StatusBadge } from './severity-badge';

const severityOptions = SEVERITY_VALUES.map((v) => ({ value: v, label: SEVERITY[v].label }));
const statusOptions = STATUS_VALUES.map((v) => ({ value: v, label: STATUS[v] }));

type PatientsTableProps = {
  /** Scope the list to one doctor (doctor detail page). */
  doctorId?: string;
  /** Extra action for the "no patients yet" state (e.g. "Add patient"). */
  emptyAction?: ReactNode;
};

export function PatientsTable({ doctorId, emptyAction }: PatientsTableProps) {
  const { params, setParams, clearParams } = useListParams(patientsUrlSchema);
  const meta = useMeta();
  const isAdmin = useIsAdmin();
  const [toDelete, setToDelete] = useState<Patient | null>(null);

  const query = useMemo(() => {
    const { patient: _openPatient, ...rest } = params; // panel state isn't part of the list request
    void _openPatient;
    const conditions = meta.data?.conditions;
    return { ...rest, condition: conditions ? rest.condition.filter((c) => conditions.includes(c)) : rest.condition };
  }, [params, meta.data]);

  const patients = usePatients(query, doctorId);
  const ageText = ageLabel(query.ageMin, query.ageMax);
  const isFiltered = Boolean(
    query.search ||
      query.condition.length ||
      query.severity.length ||
      query.status.length ||
      query.gender.length ||
      ageText ||
      query.from ||
      query.to,
  );

  const openPatient = (id: string) => setParams({ patient: id }, { resetPage: false });
  const closePatient = () => setParams({ patient: undefined }, { resetPage: false, history: 'replace' });

  const columns = useMemo<Column<Patient>[]>(() => {
    const cols: Column<Patient>[] = [
      {
        id: 'patient',
        header: 'Patient',
        sortKey: 'name',
        cell: (p) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{p.name}</p>
            <p className="truncate text-xs text-muted-foreground">{p.email || p.phone}</p>
          </div>
        ),
      },
      {
        id: 'age',
        header: 'Age',
        sortKey: 'age',
        className: 'w-20',
        cell: (p) => (
          <span className="tabular-nums">
            {p.age} <span className="text-muted-foreground">· {GENDER[p.gender][0]}</span>
          </span>
        ),
      },
      { id: 'condition', header: 'Condition', cell: (p) => p.condition },
      { id: 'severity', header: 'Severity', cell: (p) => <SeverityBadge severity={p.severity} /> },
      { id: 'status', header: 'Status', className: 'hidden lg:table-cell', cell: (p) => <StatusBadge status={p.status} /> },
    ];
    if (!doctorId) {
      cols.push({
        id: 'doctor',
        header: 'Doctor',
        className: 'hidden xl:table-cell',
        cell: (p) => (
          <Link href={`/doctors/${p.doctor._id}`} className="hover:underline" onClick={(e) => e.stopPropagation()}>
            Dr. {p.doctor.name}
          </Link>
        ),
      });
    }
    cols.push({
      id: 'admitted',
      header: 'Admitted',
      sortKey: 'admissionDate',
      sortFirst: 'desc',
      className: 'text-right',
      cell: (p) => <span className="text-muted-foreground tabular-nums">{formatDate(p.admissionDate)}</span>,
    });
    if (isAdmin) {
      cols.push({
        id: 'actions',
        header: <span className="sr-only">Actions</span>,
        className: 'w-12 text-right',
        cell: (p) => (
          // Clicks inside the menu must not also trigger the row click.
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${p.name}`} />}>
                <MoreHorizontalIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openPatient(p._id)}>
                  <PencilIcon /> View &amp; edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => setToDelete(p)}>
                  <Trash2Icon /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      });
    }
    return cols;
    // openPatient depends on setParams, which changes with the URL; columns only
    // need rebuilding when the scope or role changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId, isAdmin]);

  return (
    <div>
      <AskBar
        scope="patients"
        placeholder={'Ask, e.g. “critical diabetic women over 60 admitted last month”'}
        onApply={(filters) => clearParams(['limit'], filters)}
        describe={describePatientFilters}
      />
      <DataTableToolbar isFiltered={isFiltered} onReset={() => clearParams()}>
        <SearchInput
          value={query.search}
          onChange={(search) => setParams({ search }, { history: 'replace' })}
          placeholder="Search name, or email with @…"
        />
        <FacetedFilter
          title="Condition"
          options={toOptions(meta.data?.conditions)}
          selected={query.condition}
          onChange={(condition) => setParams({ condition })}
        />
        <FacetedFilter title="Severity" options={severityOptions} selected={query.severity} onChange={(severity) => setParams({ severity })} />
        <FacetedFilter title="Status" options={statusOptions} selected={query.status} onChange={(status) => setParams({ status })} />
        <DateRangeFilter title="Admitted" from={query.from} to={query.to} onChange={({ from, to }) => setParams({ from, to })} />
        {/* Filters without a dedicated control (set via Ask) stay visible and removable. */}
        {query.gender.length > 0 && (
          <Button variant="secondary" size="sm" className="h-8" onClick={() => setParams({ gender: [] })} aria-label="Remove gender filter">
            Gender: {query.gender.map((g) => GENDER[g]).join(', ')}
            <XIcon />
          </Button>
        )}
        {ageText && (
          <Button variant="secondary" size="sm" className="h-8" onClick={() => setParams({ ageMin: undefined, ageMax: undefined })} aria-label="Remove age filter">
            {ageText}
            <XIcon />
          </Button>
        )}
      </DataTableToolbar>

      {patients.isError && !patients.data ? (
        <ErrorState error={patients.error} onRetry={() => patients.refetch()} isRetrying={patients.isFetching} />
      ) : (
        <>
          <DataTable
            caption={doctorId ? "Doctor's patients" : 'Patients'}
            columns={columns}
            rows={patients.data?.items}
            getRowId={(p) => p._id}
            isLoading={patients.isPending}
            isFetching={patients.isPlaceholderData}
            sort={query.sort}
            onSortChange={(sort) => setParams({ sort })}
            onRowClick={(p) => openPatient(p._id)}
            renderCard={(p) => <PatientCard patient={p} onOpen={() => openPatient(p._id)} showDoctor={!doctorId} />}
            empty={
              isFiltered ? (
                <EmptyState
                  icon={SearchXIcon}
                  title="No patients match your filters"
                  description="Try a different search or remove some filters."
                  action={
                    <Button variant="outline" onClick={() => clearParams()}>
                      Reset filters
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  icon={UsersIcon}
                  title="No patients yet"
                  description={doctorId ? 'Patients added for this doctor will appear here.' : 'Patients will appear here.'}
                  action={emptyAction}
                />
              )
            }
          />
          {patients.data && (
            <DataTablePagination
              page={patients.data.page}
              limit={patients.data.limit}
              total={patients.data.total}
              totalPages={patients.data.totalPages}
              onPageChange={(page) => setParams({ page })}
              onLimitChange={(limit) => setParams({ limit })}
            />
          )}
        </>
      )}

      <PatientSheet patientId={params.patient} onClose={closePatient} />
      <DeletePatientDialog patient={toDelete} onClose={() => setToDelete(null)} />
    </div>
  );
}

function PatientCard({ patient: p, onOpen, showDoctor }: { patient: Patient; onOpen: () => void; showDoctor: boolean }) {
  return (
    <button type="button" onClick={onOpen} className="flex w-full flex-col gap-3 rounded-xl border bg-card p-4 text-left transition-colors hover:bg-muted/50">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium">{p.name}</p>
          <p className="text-xs text-muted-foreground">
            {p.age} · {GENDER[p.gender]} · {p.condition}
          </p>
        </div>
        <SeverityBadge severity={p.severity} />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="truncate">{showDoctor ? `Dr. ${p.doctor.name}` : STATUS[p.status]}</span>
        <span className="shrink-0">{formatDate(p.admissionDate)}</span>
      </div>
    </button>
  );
}
