import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { DoctorDetail } from '@/features/doctors/components/doctor-detail';

// Fallback title; the client component replaces it with the doctor's name.
export const metadata: Metadata = { title: 'Doctor' };

export default function DoctorPage() {
  // The doctor is fetched in the browser (cookie auth via the /api proxy), so
  // the id is read with useParams() inside the client component. Suspense is
  // required because the nested patients table reads the URL query.
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
      <DoctorDetail />
    </Suspense>
  );
}
