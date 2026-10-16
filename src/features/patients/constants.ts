import type { Gender, PatientStatus, Severity } from './types';

// Display labels and colors for the patient enums. Severity uses the familiar
// green / amber / red scale, always paired with a text label (never color alone)
// so it stays readable for color-blind users.
export const SEVERITY: Record<Severity, { label: string; className: string; dot: string }> = {
  stable: {
    label: 'Stable',
    className: 'bg-emerald-500/10 text-emerald-700 ring-emerald-600/20 dark:text-emerald-400 dark:ring-emerald-400/30',
    // Dots use the same status tokens as the dashboard charts → one meaning, one color.
    dot: 'bg-(--status-good)',
  },
  moderate: {
    label: 'Moderate',
    className: 'bg-amber-500/10 text-amber-800 ring-amber-600/25 dark:text-amber-300 dark:ring-amber-400/30',
    dot: 'bg-(--status-warning)',
  },
  critical: {
    label: 'Critical',
    className: 'bg-red-500/10 text-red-700 ring-red-600/20 dark:text-red-400 dark:ring-red-400/30',
    dot: 'bg-(--status-critical)',
  },
};

export const STATUS: Record<PatientStatus, string> = {
  admitted: 'Admitted',
  'under-treatment': 'Under treatment',
  discharged: 'Discharged',
};

export const GENDER: Record<Gender, string> = { male: 'Male', female: 'Female', other: 'Other' };

export const SEVERITY_VALUES = Object.keys(SEVERITY) as Severity[];
export const STATUS_VALUES = Object.keys(STATUS) as PatientStatus[];
export const GENDER_VALUES = Object.keys(GENDER) as Gender[];
