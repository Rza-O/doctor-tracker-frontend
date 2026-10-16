import { SearchIcon, ShieldCheckIcon, SparklesIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Skeleton } from '@/components/ui/skeleton';
import { LoginForm } from '@/features/auth/components/login-form';

export const metadata: Metadata = { title: 'Sign in' };

const HIGHLIGHTS = [
  { icon: SearchIcon, title: 'Instant search', text: 'Find any doctor or patient across thousands of records in milliseconds.' },
  { icon: SparklesIcon, title: 'AI-assisted', text: 'Ask in plain English and get filters and insights back.' },
  { icon: ShieldCheckIcon, title: 'Secure by default', text: 'Role-based access with httpOnly session cookies.' },
];

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel — fixed deep teal in both themes; hidden on small screens. */}
      <aside className="relative hidden overflow-hidden bg-linear-to-br from-teal-700 via-teal-800 to-teal-950 p-10 text-teal-50 lg:flex lg:flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,rgb(255_255_255/0.25),transparent_40%),radial-gradient(circle_at_80%_70%,rgb(45_212_191/0.35),transparent_45%)]"
        />
        <Logo inverted className="relative text-white" />

        <div className="relative mt-auto mb-auto max-w-md">
          <h2 className="text-4xl leading-tight font-semibold tracking-tight text-balance text-white">
            Clinical operations, at a glance.
          </h2>
          <p className="mt-4 text-teal-100/80">
            Manage doctors and their patients, spot trends on the dashboard, and find anyone in seconds.
          </p>

          <ul className="mt-10 flex flex-col gap-6">
            {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                  <Icon className="size-4.5" aria-hidden />
                </span>
                <div>
                  <p className="font-medium text-white">{title}</p>
                  <p className="text-sm text-teal-100/75">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-teal-100/60">Demo environment · all names and records are fictional.</p>
      </aside>

      <main className="flex flex-col p-6 md:p-10">
        <header className="flex items-center justify-between">
          <Logo className="lg:invisible" />
          <ThemeToggle />
        </header>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            {/* useSearchParams (for ?next=) must sit inside Suspense in Next 16. */}
            <Suspense fallback={<LoginFormSkeleton />}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}

function LoginFormSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
