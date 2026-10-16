import { Button } from '@/components/ui/button';

// Temporary placeholder; becomes a redirect to /dashboard once auth exists.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Doctor Tracker</h1>
      <p className="text-muted-foreground">Frontend scaffold is running.</p>
      <Button>Primary button</Button>
    </main>
  );
}
