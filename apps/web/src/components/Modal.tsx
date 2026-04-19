import type { ReactNode } from 'react';
import { useEffect } from 'react';

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, title, onClose, children, footer }: Props) {
  useEffect(() => {
    if (!open) return;
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-lg bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ×
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="border-t px-5 py-3 bg-slate-50 rounded-b-lg">{footer}</div>}
      </div>
    </div>
  );
}
