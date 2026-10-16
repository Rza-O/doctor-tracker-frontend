'use client';

import { ChevronsUpDownIcon, LogOutIcon, MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { useLogout, useMe } from '@/features/auth/hooks';
import { initials } from '@/lib/format';

export function NavUser() {
  const { data: user } = useMe();
  const logout = useLogout();
  const { isMobile } = useSidebar();
  const { resolvedTheme, setTheme } = useTheme();

  // Fixed-size placeholder (shadcn's SidebarMenuSkeleton uses Math.random(),
  // which Next refuses during prerendering because it can't be reproduced).
  if (!user) {
    return (
      <div className="flex h-12 items-center gap-2 px-2" aria-busy aria-label="Loading account">
        <Skeleton className="size-8 shrink-0 rounded-lg" />
        <div className="flex flex-1 flex-col gap-1.5 group-data-[collapsible=icon]:hidden">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2.5 w-32" />
        </div>
      </div>
    );
  }

  const avatar = (
    <Avatar className="size-8 rounded-lg">
      <AvatarFallback className="rounded-lg bg-primary/10 font-medium text-primary">{initials(user.name)}</AvatarFallback>
    </Avatar>
  );
  const identity = (
    <div className="grid flex-1 text-left text-sm leading-tight">
      <span className="truncate font-medium">{user.name}</span>
      <span className="truncate text-xs text-muted-foreground">{user.email}</span>
    </div>
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<SidebarMenuButton size="lg" className="data-popup-open:bg-sidebar-accent" aria-label="Account menu" />}
          >
            {avatar}
            {identity}
            <ChevronsUpDownIcon className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-60" side={isMobile ? 'bottom' : 'right'} align="end" sideOffset={8}>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center gap-2 p-1.5 font-normal">
                {avatar}
                {identity}
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <div className="px-2 pb-1.5">
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                {user.role === 'admin' ? 'Admin · full access' : 'Viewer · read-only'}
              </Badge>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
                <SunIcon className="dark:hidden" />
                <MoonIcon className="hidden dark:block" />
                Toggle theme
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => logout.mutate()} disabled={logout.isPending}>
              <LogOutIcon />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
