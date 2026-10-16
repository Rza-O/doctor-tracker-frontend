'use client';

import { SearchIcon, XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { cn } from '@/lib/utils';

type SearchInputProps = {
  /** Current value from the URL. */
  value: string | undefined;
  /** Called with the trimmed text after the user stops typing. */
  onChange: (value: string) => void;
  placeholder: string;
  debounceMs?: number;
  className?: string;
};

/**
 * Debounced search box: the field updates instantly, but the URL (and so the
 * API request) only changes 300 ms after the last keystroke — "rahman" is one
 * request, not six.
 */
export function SearchInput({ value, onChange, placeholder, debounceMs = 300, className }: SearchInputProps) {
  const external = value ?? '';
  const [text, setText] = useState(external);

  // Follow outside changes (e.g. "Clear filters" or Back button) without an
  // effect: React's recommended "adjust state when a prop changes" pattern.
  const [lastExternal, setLastExternal] = useState(external);
  if (external !== lastExternal) {
    setLastExternal(external);
    if (external !== text.trim()) setText(external);
  }

  useEffect(() => {
    const trimmed = text.trim();
    if (trimmed === external) return;
    const timer = setTimeout(() => onChange(trimmed), debounceMs);
    return () => clearTimeout(timer);
  }, [text, external, onChange, debounceMs]);

  return (
    <InputGroup className={cn('w-full sm:w-72', className)}>
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput
        // type="search" for semantics and the mobile keyboard's search key; the
        // browser's own clear (×) is hidden because we render a consistent one.
        type="search"
        className="[&::-webkit-search-cancel-button]:appearance-none"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {text && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" aria-label="Clear search" onClick={() => setText('')}>
            <XIcon />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}
