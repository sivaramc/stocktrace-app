import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'buy' | 'sell' | 'ghost';

const styles: Record<Variant, string> = {
  primary: 'bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-400',
  secondary: 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 disabled:opacity-60',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300',
  buy: 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-300',
  sell: 'bg-rose-600 text-white hover:bg-rose-700 disabled:bg-rose-300',
  ghost: 'text-slate-700 hover:bg-slate-100',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

export function Button({ variant = 'primary', loading, disabled, className, children, ...rest }: Props) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded px-3 py-1.5 text-sm font-medium transition-colors ${styles[variant]} ${className ?? ''}`}
      {...rest}
    >
      {loading && <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
      {children}
    </button>
  );
}
