import { apiFetch } from '@/lib/api-client';
import type { Paginated } from '@/lib/types';
import type { Patient, PatientInput, PatientListQuery } from './types';

/** All patients, or only one doctor's patients when `doctorId` is given. */
export function listPatients(query: PatientListQuery, doctorId: string | undefined, signal?: AbortSignal) {
  const path = doctorId ? `/doctors/${doctorId}/patients` : '/patients';
  return apiFetch<Paginated<Patient>>(path, { query, signal });
}

export function getPatient(id: string, signal?: AbortSignal) {
  return apiFetch<Patient>(`/patients/${id}`, { signal });
}

export function createPatient(doctorId: string, input: PatientInput) {
  return apiFetch<Patient>(`/doctors/${doctorId}/patients`, { method: 'POST', body: input });
}

export function updatePatient(id: string, patch: Partial<PatientInput>) {
  return apiFetch<Patient>(`/patients/${id}`, { method: 'PATCH', body: patch });
}

export function deletePatient(id: string) {
  return apiFetch<{ _id: string }>(`/patients/${id}`, { method: 'DELETE' });
}
