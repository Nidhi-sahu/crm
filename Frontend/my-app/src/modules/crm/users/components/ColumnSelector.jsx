import { useEffect, useRef, useState } from 'react';
import { USER_COLUMNS } from '../constants/userColumns';

const COLUMN_LABEL = Object.fromEntries(USER_COLUMNS.map((c) => [c.key, c.label]));
const HIDEABLE = Object.fromEntries(USER_COLUMNS.map((c) => [c.key, c.hideable]));

const ArrowIcon = ({ up }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className={up ? '' : 'rotate-180'}
  >
    <path d="m6 15 6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function ColumnSelector({ order, hiddenKeys, onMove, onToggle, onReset }) {
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
        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
        Columns
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-1 w-64 rounded-lg border border-slate-200 bg-white p-2 shadow-card">
          <p className="px-2 pb-1 pt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Show / Hide & Reorder
          </p>
          <ul>
            {order.map((key, idx) => (
              <li
                key={key}
                className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  disabled={!HIDEABLE[key]}
                  checked={!hiddenKeys.includes(key)}
                  onChange={() => onToggle(key)}
                  className="h-3.5 w-3.5 accent-brand-600 disabled:opacity-40"
                />
                <span className="flex-1 text-slate-700">{COLUMN_LABEL[key]}</span>
                <button
                  type="button"
                  onClick={() => onMove(idx, -1)}
                  disabled={idx === 0}
                  aria-label="Move up"
                  className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                >
                  <ArrowIcon up />
                </button>
                <button
                  type="button"
                  onClick={() => onMove(idx, 1)}
                  disabled={idx === order.length - 1}
                  aria-label="Move down"
                  className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                >
                  <ArrowIcon up={false} />
                </button>
              </li>
            ))}
          </ul>
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
