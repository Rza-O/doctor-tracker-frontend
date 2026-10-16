import { format, parseISO } from 'date-fns';
import { GENDER, SEVERITY, STATUS } from '@/features/patients/constants';
import type { Gender, PatientStatus, Severity } from '@/features/patients/types';
import type { AskResult } from './api';

type Filters = AskResult['filters'];

const list = (v: unknown) => (Array.isArray(v) ? (v as string[]) : []);
const day = (iso: string) => format(parseISO(iso), 'MMM d, yyyy');

function dateChip(label: string, from?: unknown, to?: unknown) {
  if (typeof from === 'string' && typeof to === 'string') return `${label} ${day(from)} – ${day(to)}`;
  if (typeof from === 'string') return `${label} since ${day(from)}`;
  if (typeof to === 'string') return `${label} until ${day(to)}`;
  return null;
}

const SORT_LABELS: Record<string, string> = {
  '-admissionDate': 'Newest admissions first',
  admissionDate: 'Oldest admissions first',
  name: 'Name A–Z',
  '-name': 'Name Z–A',
  age: 'Youngest first',
  '-age': 'Oldest first',
  '-createdAt': 'Newest doctors first',
  createdAt: 'Longest-serving first',
};

/** Human-readable chips for the patient filters the AI applied. */
export function describePatientFilters(f: Filters): string[] {
  const chips: string[] = [];
  if (f.search) chips.push(`Name/email: “${f.search}”`);
  if (list(f.condition).length) chips.push(`Condition: ${list(f.condition).join(', ')}`);
  if (list(f.severity).length) chips.push(`Severity: ${list(f.severity).map((s) => SEVERITY[s as Severity]?.label ?? s).join(', ')}`);
  if (list(f.status).length) chips.push(`Status: ${list(f.status).map((s) => STATUS[s as PatientStatus] ?? s).join(', ')}`);
  if (list(f.gender).length) chips.push(`Gender: ${list(f.gender).map((g) => GENDER[g as Gender] ?? g).join(', ')}`);
  const age = ageLabel(f.ageMin, f.ageMax);
  if (age) chips.push(age);
  const dates = dateChip('Admitted', f.from, f.to);
  if (dates) chips.push(dates);
  if (typeof f.sort === 'string') chips.push(SORT_LABELS[f.sort] ?? f.sort);
  return chips;
}

/** Human-readable chips for the doctor filters the AI applied. */
export function describeDoctorFilters(f: Filters): string[] {
  const chips: string[] = [];
  if (f.search) chips.push(`Name: “${f.search}”`);
  if (list(f.specialization).length) chips.push(`Specialization: ${list(f.specialization).join(', ')}`);
  if (list(f.hospital).length) chips.push(`Hospital: ${list(f.hospital).join(', ')}`);
  const dates = dateChip('Joined', f.from, f.to);
  if (dates) chips.push(dates);
  if (typeof f.sort === 'string') chips.push(SORT_LABELS[f.sort] ?? f.sort);
  return chips;
}

export function ageLabel(min: unknown, max: unknown): string | null {
  const lo = typeof min === 'number' ? min : undefined;
  const hi = typeof max === 'number' ? max : undefined;
  if (lo !== undefined && hi !== undefined) return `Age ${lo}–${hi}`;
  if (lo !== undefined) return `Age ${lo}+`;
  if (hi !== undefined) return `Age ≤ ${hi}`;
  return null;
}
