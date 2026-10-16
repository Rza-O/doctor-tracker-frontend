'use client';

import { format, parseISO, startOfYear, subDays } from 'date-fns';
import { CalendarIcon, XIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

type DateRangeFilterProps = {
  title: string;
  /** "yyyy-MM-dd" strings from the URL. */
  from?: string;
  to?: string;
  onChange: (range: { from?: string; to?: string }) => void;
};

const toParam = (d: Date | undefined) => (d ? format(d, 'yyyy-MM-dd') : undefined);

const PRESETS = [
  { label: 'Last 7 days', range: () => ({ from: subDays(new Date(), 6), to: new Date() }) },
  { label: 'Last 30 days', range: () => ({ from: subDays(new Date(), 29), to: new Date() }) },
  { label: 'Last 90 days', range: () => ({ from: subDays(new Date(), 89), to: new Date() }) },
  { label: 'This year', range: () => ({ from: startOfYear(new Date()), to: new Date() }) },
];

/** Date range filter with quick presets and a two-month calendar. */
export function DateRangeFilter({ title, from, to, onChange }: DateRangeFilterProps) {
  const selected: DateRange | undefined = from || to ? { from: from ? parseISO(from) : undefined, to: to ? parseISO(to) : undefined } : undefined;
  const label = selected?.from
    ? selected.to
      ? `${format(selected.from, 'MMM d, yyyy')} – ${format(selected.to, 'MMM d, yyyy')}`
      : `From ${format(selected.from, 'MMM d, yyyy')}`
    : selected?.to
      ? `Until ${format(selected.to, 'MMM d, yyyy')}`
      : null;

  return (
    <div className="flex items-center">
      <Popover>
        <PopoverTrigger
          render={<Button variant="outline" size="sm" className={label ? 'h-8 rounded-r-none border-r-0' : 'h-8 border-dashed'} />}
        >
          <CalendarIcon />
          {label ?? title}
        </PopoverTrigger>
        <PopoverContent className="flex w-auto flex-col gap-0 p-0 sm:flex-row" align="start">
          <div className="flex flex-wrap gap-1 p-2 sm:w-36 sm:flex-col">
            {PRESETS.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => {
                  const r = preset.range();
                  onChange({ from: toParam(r.from), to: toParam(r.to) });
                }}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <Separator orientation="vertical" className="hidden sm:block" />
          <Calendar
            mode="range"
            numberOfMonths={2}
            defaultMonth={selected?.from ?? subDays(new Date(), 30)}
            selected={selected}
            onSelect={(range) => onChange({ from: toParam(range?.from), to: toParam(range?.to) })}
            disabled={{ after: new Date() }}
          />
        </PopoverContent>
      </Popover>
      {label && (
        <Button
          variant="outline"
          size="icon-sm"
          className="h-8 rounded-l-none"
          aria-label={`Clear ${title.toLowerCase()} filter`}
          onClick={() => onChange({})}
        >
          <XIcon />
        </Button>
      )}
    </div>
  );
}
