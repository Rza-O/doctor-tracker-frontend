'use client';

import { ArrowRightIcon, CircleAlertIcon, SparklesIcon, Undo2Icon, XIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { Spinner } from '@/components/ui/spinner';
import { ApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import type { AskResult, AskScope } from '../api';
import { useAIEnabled, useAsk } from '../hooks';

type AskBarProps = {
  scope: AskScope;
  placeholder: string;
  /** Replace the current filters with the AI's (validated) filters. */
  onApply: (filters: AskResult['filters']) => void;
  /** Human-readable chips for a set of filters ("Severity: Critical"). */
  describe: (filters: AskResult['filters']) => string[];
};

type Interpretation = { chips: string[]; explanation: string; unsupported: string[]; previousUrl: string };

/**
 * Natural-language search. The AI only suggests filters; they're validated on
 * the server, applied as ordinary URL filters, shown back as chips, and can be
 * undone in one click. Hidden entirely when the server has no AI configured.
 */
export function AskBar({ scope, placeholder, onApply, describe }: AskBarProps) {
  const enabled = useAIEnabled();
  const router = useRouter();
  const ask = useAsk(scope);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<Interpretation | null>(null);

  if (!enabled) return null;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const text = query.trim();
    if (text.length < 2 || ask.isPending) return;
    const previousUrl = window.location.pathname + window.location.search;
    ask.mutate(text, {
      onSuccess: (data) => {
        const chips = describe(data.filters);
        if (chips.length) onApply(data.filters);
        setResult({ chips, explanation: data.explanation, unsupported: data.unsupported, previousUrl });
      },
    });
  };

  const error = ask.error ? (ask.error instanceof ApiError ? ask.error.message : 'Something went wrong. Please try again.') : null;

  return (
    <div className="flex flex-col gap-2 pb-3">
      <form onSubmit={submit} role="search" aria-label={`Ask about ${scope} in plain English`}>
        <InputGroup className="h-10 bg-card">
          <InputGroupAddon>
            <SparklesIcon className="text-primary" />
          </InputGroupAddon>
          <InputGroupInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            maxLength={300}
            aria-label="Ask in plain English"
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton type="submit" variant="default" size="sm" disabled={ask.isPending || query.trim().length < 2}>
              {ask.isPending ? <Spinner /> : <ArrowRightIcon />}
              {ask.isPending ? 'Thinking…' : 'Ask'}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </form>

      {error && (
        <p className="flex items-center gap-1.5 text-sm text-destructive" role="alert">
          <CircleAlertIcon className="size-4" aria-hidden /> {error}
        </p>
      )}

      {result && !ask.isPending && (
        <div
          className={cn('flex flex-col gap-2 rounded-lg border px-3 py-2.5 text-sm', result.chips.length ? 'bg-primary/5' : 'bg-muted/40')}
          role="status"
          aria-live="polite"
        >
          <div className="flex flex-wrap items-center gap-1.5">
            <SparklesIcon className="size-3.5 text-primary" aria-hidden />
            {result.chips.length ? (
              <>
                <span className="text-muted-foreground">Interpreted as</span>
                {result.chips.map((chip) => (
                  <Badge key={chip} variant="secondary" className="font-normal">
                    {chip}
                  </Badge>
                ))}
              </>
            ) : (
              <span className="text-muted-foreground">{result.explanation || 'No matching filters found for that request.'}</span>
            )}
            <div className="ml-auto flex items-center gap-1">
              {result.chips.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7"
                  onClick={() => {
                    router.push(result.previousUrl, { scroll: false });
                    setResult(null);
                  }}
                >
                  <Undo2Icon /> Undo
                </Button>
              )}
              <Button variant="ghost" size="icon-sm" className="size-7" aria-label="Dismiss" onClick={() => setResult(null)}>
                <XIcon />
              </Button>
            </div>
          </div>
          {result.unsupported.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Couldn&apos;t filter by: {result.unsupported.map((u) => `“${u}”`).join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
