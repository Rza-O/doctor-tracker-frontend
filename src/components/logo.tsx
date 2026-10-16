import { HeartPulseIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2 font-semibold tracking-tight', className)}>
      <span
        className={cn(
          'flex size-8 items-center justify-center rounded-lg',
          inverted ? 'bg-white/15 text-white' : 'bg-primary text-primary-foreground',
        )}
      >
        <HeartPulseIcon className="size-4.5" aria-hidden />
      </span>
      Doctor Tracker
    </div>
  );
}
