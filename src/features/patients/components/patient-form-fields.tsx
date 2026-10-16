'use client';

import { format } from 'date-fns';
import { SparklesIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Controller, type Control, type FieldPath } from 'react-hook-form';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMeta } from '@/features/meta/hooks';
import { GENDER, SEVERITY, STATUS } from '../constants';
import type { PatientFormInput } from '../schemas';

type Props = {
  control: Control<PatientFormInput, unknown, unknown>;
  /** Unique prefix so two forms on a page never share input ids. */
  idPrefix: string;
  /** Fields pre-filled by smart intake and not yet touched by the user. */
  aiFilled?: ReadonlySet<string>;
  /** Called when the user changes a field (clears its AI marker). */
  onUserEdit?: (name: string) => void;
};

/** The patient fields, shared by "Add patient" and the edit side panel. */
export function PatientFormFields({ control, idPrefix, aiFilled, onUserEdit }: Props) {
  const meta = useMeta();
  const id = (name: string) => `${idPrefix}-${name}`;
  const severityLabels = Object.fromEntries(Object.entries(SEVERITY).map(([k, v]) => [k, v.label]));

  // AI-filled fields carry a ✨ marker until reviewed (edited) by the user.
  const fieldLabel = (name: string, label: string) => (
    <FieldLabel htmlFor={id(name)}>
      {label}
      {aiFilled?.has(name) && (
        <span className="inline-flex items-center gap-0.5 rounded bg-primary/10 px-1 text-[10px] font-medium text-primary">
          <SparklesIcon className="size-3" aria-hidden /> AI
        </span>
      )}
    </FieldLabel>
  );

  const text = (name: FieldPath<PatientFormInput>, label: string, props: Partial<React.ComponentProps<typeof Input>> = {}) => (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          {fieldLabel(name, label)}
          <Input
            {...field}
            onChange={(e) => {
              onUserEdit?.(name);
              field.onChange(e);
            }}
            id={id(name)}
            autoComplete="off"
            aria-invalid={fieldState.invalid}
            {...props}
          />
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );

  const select = (name: FieldPath<PatientFormInput>, label: string, items: Record<string, ReactNode>) => (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          {fieldLabel(name, label)}
          {/* `items` lets the trigger show the label ("Under treatment"), not the raw value. */}
          <Select
            items={items}
            value={field.value || null}
            onValueChange={(v) => {
              onUserEdit?.(name);
              field.onChange(v ?? '');
            }}
          >
            <SelectTrigger id={id(name)} className="w-full" aria-invalid={fieldState.invalid} onBlur={field.onBlur}>
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(items).map(([value, itemLabel]) => (
                <SelectItem key={value} value={value}>
                  {itemLabel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );

  const conditions = Object.fromEntries((meta.data?.conditions ?? []).map((c) => [c, c]));

  return (
    <FieldGroup>
      {text('name', 'Full name', { placeholder: 'Tasnim Hossain' })}
      <div className="grid grid-cols-2 gap-4">
        {text('age', 'Age', { type: 'number', inputMode: 'numeric', min: 0, max: 130 })}
        {select('gender', 'Gender', GENDER)}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {text('phone', 'Phone', { type: 'tel', placeholder: '+8801811000000' })}
        {text('email', 'Email (optional)', { type: 'email', placeholder: 'name@example.com' })}
      </div>
      {select('condition', 'Condition', conditions)}
      <div className="grid grid-cols-2 gap-4">
        {select('severity', 'Severity', severityLabels)}
        {select('status', 'Status', STATUS)}
      </div>
      {text('admissionDate', 'Admission date', { type: 'date', max: format(new Date(), 'yyyy-MM-dd') })}
    </FieldGroup>
  );
}
