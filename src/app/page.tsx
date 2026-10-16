import { redirect } from 'next/navigation';

// "/" has no page of its own. The proxy already routes signed-out users to
// /login; everyone else lands on the dashboard.
export default function Home() {
  redirect('/dashboard');
}
