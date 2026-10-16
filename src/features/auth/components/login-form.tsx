'use client';

import { EyeIcon, EyeOffIcon, GlassesIcon, ShieldCheckIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { Spinner } from '@/components/ui/spinner';
import { ApiError, refreshSession } from '@/lib/api-client';
import { zodResolver } from '@/lib/zod-resolver';
import { useLogin } from '../hooks';
import { loginSchema, safeNextPath, type LoginValues } from '../schemas';
import { useServerStatus } from '../use-server-status';
import { ServerStatusNotice } from './server-status-notice';

// Public demo accounts for reviewers. Set via env so they're not hard-coded;
// if unset, the demo buttons simply don't render.
const DEMO_ACCOUNTS = [
  {
    label: 'Admin',
    hint: 'Full access',
    icon: ShieldCheckIcon,
    email: process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL,
    password: process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD,
  },
  {
    label: 'Viewer',
    hint: 'Read-only',
    icon: GlassesIcon,
    email: process.env.NEXT_PUBLIC_DEMO_VIEWER_EMAIL,
    password: process.env.NEXT_PUBLIC_DEMO_VIEWER_PASSWORD,
  },
].filter((a): a is typeof a & { email: string; password: string } => Boolean(a.email && a.password));

export function LoginForm() {
  const router = useRouter();
  const nextPath = safeNextPath(useSearchParams().get('next'));
  const serverStatus = useServerStatus();
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // The proxy sends users here when the 15-min access cookie is gone. If their
  // 7-day refresh cookie is still valid, restore the session and go straight back.
  // Only attempted when the readable `has_session` hint exists, so first-time
  // visitors don't fire a refresh that can only fail.
  useEffect(() => {
    if (!document.cookie.split('; ').some((c) => c.startsWith('has_session='))) return;
    let cancelled = false;
    refreshSession().then((ok) => {
      if (ok && !cancelled) router.replace(nextPath);
    });
    return () => {
      cancelled = true;
    };
  }, [router, nextPath]);

  const onSubmit = form.handleSubmit((values) =>
    login.mutate(values, {
      onSuccess: (user) => {
        toast.success(`Welcome back, ${user.name.split(' ')[0]}`);
        router.replace(nextPath);
      },
    }),
  );

  const signInAsDemo = (account: (typeof DEMO_ACCOUNTS)[number]) => {
    form.setValue('email', account.email, { shouldValidate: true });
    form.setValue('password', account.password, { shouldValidate: true });
    void onSubmit();
  };

  const errorMessage = login.error
    ? login.error instanceof ApiError
      ? login.error.message
      : 'Something went wrong. Please try again.'
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-sm text-muted-foreground">Access the doctor and patient management portal.</p>
      </div>

      <ServerStatusNotice status={serverStatus} />

      <form onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  {...field}
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@hospital.com"
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    aria-invalid={fieldState.invalid}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-xs"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          {errorMessage && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" size="lg" disabled={login.isPending}>
            {login.isPending && <Spinner />}
            {login.isPending ? 'Signing in…' : 'Sign in'}
          </Button>

          {DEMO_ACCOUNTS.length > 0 && (
            <>
              <FieldSeparator>Or explore with a demo account</FieldSeparator>
              <div className="grid grid-cols-2 gap-3">
                {DEMO_ACCOUNTS.map((account) => (
                  <Button
                    key={account.label}
                    type="button"
                    variant="outline"
                    className="h-auto flex-col items-start gap-0.5 px-3 py-2.5 text-left"
                    disabled={login.isPending}
                    onClick={() => signInAsDemo(account)}
                  >
                    <span className="flex items-center gap-1.5 font-medium">
                      <account.icon className="size-3.5" aria-hidden />
                      {account.label}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">{account.hint}</span>
                  </Button>
                ))}
              </div>
            </>
          )}
        </FieldGroup>
      </form>
    </div>
  );
}
