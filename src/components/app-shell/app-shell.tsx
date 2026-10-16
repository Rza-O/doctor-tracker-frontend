'use client';

import type { ReactNode } from 'react';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { AppHeader } from './app-header';
import { AppSidebar } from './app-sidebar';
import { BreadcrumbProvider } from './breadcrumbs';

/**
 * Frame for every signed-in page: sidebar + sticky header + content.
 *
 * Pages render immediately instead of waiting for the "who am I" request, so
 * their data requests start in parallel (no waterfall). Role-based actions stay
 * hidden until the role is known, and a dead session is redirected to /login
 * by the query client.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:shadow"
      >
        Skip to content
      </a>
      <BreadcrumbProvider>
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          {/* Extra bottom space in development only, so the floating dev tools
              (React Query devtools, Next indicator) never cover page controls. */}
          <main
            id="main-content"
            tabIndex={-1}
            className={cn('flex flex-1 flex-col p-4 outline-none md:p-6', process.env.NODE_ENV === 'development' && 'pb-20 md:pb-20')}
          >
            {children}
          </main>
        </SidebarInset>
      </BreadcrumbProvider>
    </SidebarProvider>
  );
}
