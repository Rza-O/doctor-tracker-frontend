import { apiFetch } from '@/lib/api-client';
import type { Paginated } from '@/lib/types';
import type { CreateDoctorInput, Doctor, DoctorListQuery } from './types';

export function listDoctors(query: DoctorListQuery, signal?: AbortSignal) {
  return apiFetch<Paginated<Doctor>>('/doctors', { query, signal });
}

export function getDoctor(id: string, signal?: AbortSignal) {
  return apiFetch<Doctor>(`/doctors/${id}`, { signal });
}

export function createDoctor(input: CreateDoctorInput) {
  return apiFetch<Doctor>('/doctors', { method: 'POST', body: input });
}
