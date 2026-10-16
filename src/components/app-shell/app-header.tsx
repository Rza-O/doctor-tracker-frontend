import { Suspense } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { AppBreadcrumbs } from './breadcrumbs';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur supports-backdrop-filter:bg-background/60 md:px-6">
      <SidebarTrigger className="-ml-1" aria-label="Toggle sidebar" />
      <Separator orientation="vertical" className="mr-1 data-vertical:h-4" />
      {/* Reads the URL → Suspense so dynamic routes can still prerender the shell. */}
      <Suspense fallback={null}>
        <AppBreadcrumbs />
      </Suspense>
      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
      </div>
    </header>
  );
}
