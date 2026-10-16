import { AppShell } from '@/components/app-shell/app-shell';

// Every route in the (app) group (dashboard, doctors, patients) shares this
// frame. The group name in parentheses doesn't appear in the URL.
export default function AppLayout({ children }: LayoutProps<'/'>) {
  return <AppShell>{children}</AppShell>;
}
