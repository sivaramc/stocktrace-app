import type { InputHTMLAttributes, ReactNode } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: ReactNode;
  error?: string | null;
}

export function FormField({ label, hint, error, className, id, ...rest }: FormFieldProps) {
  const fieldId = id ?? rest.name;
  return (
    <label htmlFor={fieldId} className="block">
      <span className="block text-sm font-medium text-slate-700 mb-1">{label}</span>
      <input
        id={fieldId}
        className={`block w-full rounded border px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-slate-900/20 ${
          error ? 'border-red-400' : 'border-slate-300'
        } ${className ?? ''}`}
        {...rest}
      />
      {hint && !error && <span className="block text-xs text-slate-500 mt-1">{hint}</span>}
      {error && <span className="block text-xs text-red-600 mt-1">{error}</span>}
    </label>
  );
}
