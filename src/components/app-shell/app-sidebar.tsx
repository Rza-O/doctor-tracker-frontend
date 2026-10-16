'use client';

import { EyeIcon, HeartPulseIcon, LayoutDashboardIcon, StethoscopeIcon, UsersIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { useMe } from '@/features/auth/hooks';
import { NavUser } from './nav-user';

const NAV_ITEMS = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboardIcon },
  { title: 'Doctors', href: '/doctors', icon: StethoscopeIcon },
  { title: 'Patients', href: '/patients', icon: UsersIcon },
];

/** Nav links; `activePath` null = no highlight (prerender fallback). */
function NavMenu({ activePath }: { activePath: string | null }) {
  const { isMobile, setOpenMobile } = useSidebar();
  // On phones the sidebar is a drawer: close it once a link is chosen.
  const closeOnMobile = () => isMobile && setOpenMobile(false);

  return (
    <SidebarMenu>
      {NAV_ITEMS.map((item) => {
        // Active for the section and anything under it (e.g. /doctors/123).
        const isActive = activePath !== null && (activePath === item.href || activePath.startsWith(`${item.href}/`));
        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              isActive={isActive}
              tooltip={item.title}
              render={<Link href={item.href} aria-current={isActive ? 'page' : undefined} onClick={closeOnMobile} />}
            >
              <item.icon />
              <span>{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

function ActiveNavMenu() {
  return <NavMenu activePath={usePathname()} />;
}

export function AppSidebar() {
  const { isMobile, setOpenMobile } = useSidebar();
  const isViewer = useMe().data?.role === 'viewer';
  const closeOnMobile = () => isMobile && setOpenMobile(false);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" onClick={closeOnMobile} />}>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <HeartPulseIcon className="size-4" aria-hidden />
              </span>
              <span className="truncate font-semibold tracking-tight">Doctor Tracker</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            {/* The current path isn't known while prerendering dynamic routes
                (/doctors/[id]); show the menu without a highlight until it is. */}
            <Suspense fallback={<NavMenu activePath={null} />}>
              <ActiveNavMenu />
            </Suspense>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {/* Tell viewers up front why there are no create/edit/delete buttons. */}
        {isViewer && (
          <div className="flex items-start gap-2 rounded-lg border bg-sidebar-accent/50 p-2.5 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
            <EyeIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <span>
              You have <span className="font-medium text-foreground">read-only</span> access. Sign in as an admin to make
              changes.
            </span>
          </div>
        )}
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
