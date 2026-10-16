// Mirrors GET /api/v1/stats.
export type StatRange = '30d' | '90d' | '12m';

export type KeyCount = { key: string; count: number };

export type DashboardStats = {
  range: StatRange;
  generatedAt: string;
  /** What the period-scoped charts cover. */
  period: { from: string; admissions: number };
  /** All-time snapshot (not affected by the period). */
  kpis: {
    totalDoctors: number;
    totalPatients: number;
    inCare: number;
    critical: number;
    avgPatientsPerDoctor: number;
    newThisMonth: number;
    newLastMonthToDate: number;
    monthOverMonthChangePct: number | null;
  };
  admissionsOverTime: {
    unit: 'day' | 'week' | 'month';
    points: { bucket: string; total: number; critical: number }[];
  };
  topDoctors: { doctorId: string; name: string; specialization: string; patients: number }[];
  bySpecialization: { key: string; doctors: number; patients: number }[];
  byCondition: KeyCount[];
  bySeverity: KeyCount[];
  byStatus: KeyCount[];
};
