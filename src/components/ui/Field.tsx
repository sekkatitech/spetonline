import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from 'react';

const CONTROL =
  'w-full rounded-lg border bg-spet-surface px-3.5 text-sm text-spet-ink placeholder:text-spet-was focus:border-spet-blue focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-60';

function describedBy(id: string, hint?: string, error?: string) {
  return [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined;
}

function FieldMessages({ id, hint, error }: { id: string; hint?: string; error?: string }) {
  return (
    <>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-[12px] text-spet-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-[12px] text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </>
  );
}

const LABEL = 'mb-1.5 block text-[13px] font-medium text-spet-ink';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
  hideLabel?: boolean;
}

export function TextField({ id, label, hint, error, wrapperClassName, hideLabel, className = '', ...props }: TextFieldProps) {
  return (
    <div className={wrapperClassName}>
      <label htmlFor={id} className={hideLabel ? 'sr-only' : LABEL}>
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={`${CONTROL} h-11 ${error ? 'border-red-500' : 'border-spet-line'} ${className}`}
        {...props}
      />
      <FieldMessages id={id} hint={hint} error={error} />
    </div>
  );
}

export function PasswordField({ id, label, hint, error, wrapperClassName, className = '', ...props }: TextFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={wrapperClassName}>
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          className={`${CONTROL} h-11 pr-11 ${error ? 'border-red-500' : 'border-spet-line'} ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-spet-muted transition-colors hover:text-spet-ink"
        >
          {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
      <FieldMessages id={id} hint={hint} error={error} />
    </div>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  options: readonly { value: string; label: string }[];
  wrapperClassName?: string;
  hideLabel?: boolean;
}

export function SelectField({
  id,
  label,
  hint,
  error,
  options,
  wrapperClassName,
  hideLabel,
  className = '',
  ...props
}: SelectFieldProps) {
  return (
    <div className={wrapperClassName}>
      <label htmlFor={id} className={hideLabel ? 'sr-only' : LABEL}>
        {label}
      </label>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={`${CONTROL} h-11 ${error ? 'border-red-500' : 'border-spet-line'} ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldMessages id={id} hint={hint} error={error} />
    </div>
  );
}

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
}

export function TextareaField({
  id,
  label,
  hint,
  error,
  wrapperClassName,
  className = '',
  rows = 4,
  ...props
}: TextareaFieldProps) {
  return (
    <div className={wrapperClassName}>
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={`${CONTROL} py-2.5 ${error ? 'border-red-500' : 'border-spet-line'} ${className}`}
        {...props}
      />
      <FieldMessages id={id} hint={hint} error={error} />
    </div>
  );
}

interface CheckboxFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: ReactNode;
  description?: string;
  error?: string;
}

export function CheckboxField({ id, label, description, error, className = '', ...props }: CheckboxFieldProps) {
  return (
    <div>
      <div className="flex items-start gap-2.5">
        <input
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, description, error)}
          className={`mt-0.5 h-4 w-4 shrink-0 rounded border-spet-line text-spet-blue accent-spet-blue ${className}`}
          {...props}
        />
        <label htmlFor={id} className="text-[13px] leading-snug text-spet-ink-2">
          {label}
        </label>
      </div>
      {description && (
        <p id={`${id}-hint`} className="ml-6 mt-1 text-[12px] text-spet-muted">
          {description}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="ml-6 mt-1 text-[12px] text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
