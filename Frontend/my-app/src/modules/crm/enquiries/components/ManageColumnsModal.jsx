import { useState } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M9.4 5.2A9.6 9.6 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-2.2 3M6.2 6.2A17 17 0 0 0 2 12s3.5 7 10 7a9.5 9.5 0 0 0 3-.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function ManageColumnsModal({
  open,
  columns,
  onClose,
  onRename,
  onToggle,
  onAdd,
  onReset,
}) {
  const [newLabel, setNewLabel] = useState('');

  const visibleCount = columns.filter((c) => c.visible).length;

  const handleAdd = () => {
    const name = newLabel.trim();
    if (!name) return;
    onAdd(name);
    setNewLabel('');
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Manage Columns"
      subtitle="Rename headings, show / hide, or add new columns"
      width="max-w-lg"
      footer={
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onReset}
            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            Reset to defaults
          </button>
          <Button
            variant="primary"
            onClick={onClose}
            className="!gap-1.5 !rounded-md !px-4 !py-1.5 !text-xs"
          >
            Done
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Columns
          </p>
          <p className="text-[11px] text-slate-400">
            {visibleCount} of {columns.length} shown
          </p>
        </div>

        <div className="space-y-1.5">
          {columns.map((col) => (
            <div
              key={col.key}
              className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 transition-colors ${
                col.visible ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50'
              }`}
            >
              <button
                type="button"
                onClick={() => onToggle(col.key)}
                disabled={!col.hideable}
                title={
                  !col.hideable
                    ? 'This column is always visible'
                    : col.visible
                      ? 'Hide column'
                      : 'Show column'
                }
                className={`shrink-0 rounded-md p-1.5 transition-colors ${
                  col.visible
                    ? 'text-brand-600 hover:bg-brand-50'
                    : 'text-slate-300 hover:bg-slate-100'
                } disabled:cursor-not-allowed disabled:opacity-40`}
              >
                {col.visible ? <EyeIcon /> : <EyeOffIcon />}
              </button>

              <input
                value={col.label}
                onChange={(e) => onRename(col.key, e.target.value)}
                placeholder="Column name"
                className={`min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-sm hover:border-slate-200 focus:border-brand-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100 ${
                  col.visible ? 'text-slate-800' : 'text-slate-400'
                }`}
              />

              {col.custom && (
                <span className="shrink-0 rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-600">
                  custom
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-dashed border-brand-300 bg-brand-50/60 p-3">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand-600">
            Add new column
          </p>
          <div className="flex items-center gap-2">
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAdd();
                }
              }}
              placeholder="e.g. Budget, Source, Location…"
              className="min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <Button
              variant="primary"
              onClick={handleAdd}
              disabled={!newLabel.trim()}
              className="!shrink-0 !gap-1 !rounded-md !px-3 !py-2 !text-xs"
            >
              + Add
            </Button>
          </div>
          <p className="mt-1.5 text-[11px] text-slate-500">
            New columns appear with empty cells for now. Changes save automatically in this browser.
          </p>
        </div>
      </div>
    </Modal>
  );
}
