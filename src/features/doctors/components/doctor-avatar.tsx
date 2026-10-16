import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { initials } from '@/lib/format';
import { cn } from '@/lib/utils';

export function DoctorAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <Avatar className={cn('size-9 rounded-lg', className)}>
      <AvatarFallback className="rounded-lg bg-primary/10 text-xs font-medium text-primary">{initials(name)}</AvatarFallback>
    </Avatar>
  );
}
