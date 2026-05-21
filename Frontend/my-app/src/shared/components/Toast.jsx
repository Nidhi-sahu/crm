import { useEffect } from 'react';

const TONES = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  error: 'bg-rose-50 text-rose-700 border-rose-200',
  info: 'bg-brand-100 text-slate-800 border-brand-200',
};

export function Toast({ open, tone = 'success', message, onClose, duration = 3500 }) {
  useEffect(() => {
    if (!open || !duration) return undefined;
    const t = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4">
      <div
        role="status"
        className={`pointer-events-auto flex items-center gap-2 rounded-lg border px-4 py-2 text-sm shadow-card ${TONES[tone] || TONES.info}`}
      >
        <span>{message}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="ml-2 rounded-md p-1 text-current hover:bg-black/5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6 6 18"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
