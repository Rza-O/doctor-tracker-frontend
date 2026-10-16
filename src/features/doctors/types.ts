// Mirrors the backend Doctor model + the per-row patient count it adds.
export type Doctor = {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  patientCount: number;
};

export type DoctorListQuery = {
  page: number;
  limit: number;
  search?: string;
  specialization?: string[];
  hospital?: string[];
  from?: string;
  to?: string;
  sort?: string;
};

export type CreateDoctorInput = {
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
};
