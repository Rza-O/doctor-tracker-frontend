'use client';

import { formatNumber } from '@/lib/format';
import type { DashboardStats } from '../types';
import { BarList } from './bar-list';
import { ChartCard, DataTableView } from './chart-card';

type Props = { stats: DashboardStats; className?: string };

const share = (value: number, total: number) => (total ? `${Math.round((value / total) * 1000) / 10}%` : '—');

export function TopDoctors({ stats, className }: Props) {
  const total = stats.period.admissions;
  const items = stats.topDoctors.map((d) => ({
    key: d.doctorId,
    label: `Dr. ${d.name}`,
    value: d.patients,
    href: `/doctors/${d.doctorId}`,
    detail: d.specialization,
  }));

  return (
    <ChartCard
      className={className}
      title="Patients per doctor"
      description="Top 10 doctors by patients admitted in this period · click a name to open"
      chart={<BarList items={items} total={total} unit="patients" label="Top 10 doctors by patients" />}
      table={
        <DataTableView
          columns={['Doctor', 'Specialization', 'Patients', 'Share']}
          rows={stats.topDoctors.map((d) => [`Dr. ${d.name}`, d.specialization, formatNumber(d.patients), share(d.patients, total)])}
        />
      }
    />
  );
}

export function ConditionBreakdown({ stats, className }: Props) {
  const total = stats.period.admissions;
  const rows = stats.byCondition.filter((c) => c.count > 0);

  return (
    <ChartCard
      className={className}
      title="Patients by condition"
      description="Most common diagnoses among patients admitted in this period"
      chart={<BarList items={rows.map((c) => ({ key: c.key, label: c.key, value: c.count }))} total={total} unit="patients" label="Patients by condition" />}
      table={
        <DataTableView
          columns={['Condition', 'Patients', 'Share']}
          rows={stats.byCondition.map((c) => [c.key, formatNumber(c.count), share(c.count, total)])}
        />
      }
    />
  );
}

export function SpecialtyBreakdown({ stats, className }: Props) {
  const total = stats.period.admissions;
  // Doctor counts are a different measure on a different scale — they go in the
  // label, NOT on a second axis (dual-axis charts invent correlations).
  const items = stats.bySpecialization.map((s) => ({
    key: s.key,
    label: s.key,
    value: s.patients,
    detail: `${s.doctors} doctor${s.doctors === 1 ? '' : 's'}${s.doctors ? ` · ≈${Math.round(s.patients / s.doctors)} each` : ''}`,
  }));

  return (
    <ChartCard
      className={className}
      title="Patients by specialty"
      description="Workload per specialty in this period, with the number of doctors"
      chart={<BarList items={items} total={total} unit="patients" label="Patients by specialty" />}
      table={
        <DataTableView
          columns={['Specialty', 'Doctors', 'Patients', 'Per doctor']}
          rows={stats.bySpecialization.map((s) => [
            s.key,
            formatNumber(s.doctors),
            formatNumber(s.patients),
            s.doctors ? formatNumber(Math.round(s.patients / s.doctors)) : '—',
          ])}
        />
      }
    />
  );
}
