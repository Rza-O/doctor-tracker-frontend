'use client';

import { CheckIcon, PlusCircleIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export type FilterOption = { value: string; label: string };

type FacetedFilterProps = {
  title: string;
  options: readonly FilterOption[];
  selected: readonly string[];
  onChange: (values: string[]) => void;
};

/** Multi-select filter button ("Condition ▾ Asthma, Diabetes") with an optional search box. */
export function FacetedFilter({ title, options, selected, onChange }: FacetedFilterProps) {
  const chosen = new Set(selected);
  const toggle = (value: string) => {
    const next = new Set(chosen);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    // Keep the options' order so URLs are stable regardless of click order.
    onChange(options.map((o) => o.value).filter((v) => next.has(v)));
  };

  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" size="sm" className="h-8 border-dashed" />}>
        <PlusCircleIcon />
        {title}
        {chosen.size > 0 && (
          <>
            <Separator orientation="vertical" className="mx-1 data-vertical:h-4" />
            {chosen.size > 2 ? (
              <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                {chosen.size} selected
              </Badge>
            ) : (
              options
                .filter((o) => chosen.has(o.value))
                .map((o) => (
                  <Badge key={o.value} variant="secondary" className="rounded-sm px-1 font-normal">
                    {o.label}
                  </Badge>
                ))
            )}
          </>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-60 p-0" align="start">
        <Command>
          {options.length > 6 && <CommandInput placeholder={title} />}
          <CommandList>
            <CommandEmpty>No matches.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = chosen.has(option.value);
                return (
                  <CommandItem key={option.value} value={option.label} onSelect={() => toggle(option.value)}>
                    <span
                      className={cn(
                        'flex size-4 items-center justify-center rounded-sm border',
                        isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-input [&_svg]:invisible',
                      )}
                      aria-hidden
                    >
                      <CheckIcon className="size-3" />
                    </span>
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {chosen.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={() => onChange([])} className="justify-center text-center">
                    Clear filter
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
