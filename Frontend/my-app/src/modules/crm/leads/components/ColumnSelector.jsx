import { useEffect, useRef, useState } from 'react';
import { LEAD_COLUMNS } from '../constants/leadColumns';

export function ColumnSelector({ visibleKeys, onToggle, onReset }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
        Columns
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-1 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-card">
          <div className="max-h-72 overflow-y-auto">
            {LEAD_COLUMNS.map((col) => (
              <label
                key={col.key}
                className={`flex items-center gap-2 rounded px-2 py-1.5 text-sm ${
                  col.hideable ? 'cursor-pointer hover:bg-slate-50' : 'opacity-60'
                }`}
              >
                <input
                  type="checkbox"
                  disabled={!col.hideable}
                  checked={visibleKeys.includes(col.key)}
                  onChange={() => onToggle(col.key)}
                  className="h-3.5 w-3.5 accent-brand-600"
                />
                {col.label}
              </label>
            ))}
          </div>
          <div className="mt-1 border-t border-slate-100 pt-1">
            <button
              type="button"
              onClick={onReset}
              className="w-full rounded px-2 py-1 text-left text-xs text-brand-600 hover:bg-brand-50"
            >
              Reset to defaults
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
