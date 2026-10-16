export type Severity = 'stable' | 'moderate' | 'critical';
export type PatientStatus = 'admitted' | 'under-treatment' | 'discharged';
export type Gender = 'male' | 'female' | 'other';

/** The doctor summary the backend populates on every patient. */
export type PatientDoctor = { _id: string; name: string; specialization: string; hospital: string };

export type Patient = {
  _id: string;
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  email?: string | null;
  condition: string;
  severity: Severity;
  status: PatientStatus;
  doctor: PatientDoctor;
  admissionDate: string;
  createdAt: string;
  updatedAt: string;
};

export type PatientListQuery = {
  page: number;
  limit: number;
  search?: string;
  condition?: string[];
  severity?: string[];
  status?: string[];
  from?: string;
  to?: string;
  sort?: string;
};

/** Body for create (all fields) and update (only changed fields). */
export type PatientInput = {
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  email: string;
  condition: string;
  severity: Severity;
  status: PatientStatus;
  admissionDate: string;
};
