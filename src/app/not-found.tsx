import { ArrowLeftIcon, CompassIcon } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <Logo />
      <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <CompassIcon className="size-6" aria-hidden />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">404</p>
        <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <Button render={<Link href="/dashboard" />}>
        <ArrowLeftIcon /> Back to dashboard
      </Button>
    </main>
  );
}
