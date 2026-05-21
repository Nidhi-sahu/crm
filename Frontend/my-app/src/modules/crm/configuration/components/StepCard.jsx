import { useEffect, useRef, useState } from 'react';

const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 20h4L19 9l-4-4L4 16v4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="m13.5 6.5 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M5 7h14M10 7V5h4v2M6 7l1 13h10l1-13"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowIcon = ({ up }) => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className={up ? '' : 'rotate-180'}
  >
    <path d="m6 15 6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 12.5 10 17l9-10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CloseIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const IconBtn = ({ title, onClick, disabled, danger, children }) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    onClick={onClick}
    disabled={disabled}
    className={[
      'rounded-md p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-30',
      danger
        ? 'text-slate-500 hover:bg-rose-50 hover:text-rose-600'
        : 'text-slate-500 hover:bg-brand-100 hover:text-brand-600',
    ].join(' ')}
  >
    {children}
  </button>
);

export function StepCard({ step, index, total, onEdit, onDelete, onMove }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(step.name);
  const inputRef = useRef(null);

  useEffect(() => {
    setValue(step.name);
  }, [step.name]);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  const isLast = index === total - 1;
  const isFirst = index === 0;

  const commit = () => {
    const trimmed = value.trim();
    if (trimmed.length >= 2) {
      onEdit(step.key, trimmed);
      setEditing(false);
    }
  };

  const cancel = () => {
    setValue(step.name);
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-soft">
      {/* Step number circle */}
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-200 text-sm font-semibold text-slate-800">
        {index + 1}
      </span>

      {/* Name + next/final */}
      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit();
              if (e.key === 'Escape') cancel();
            }}
            className="w-full rounded-md border border-brand-300 px-2 py-1 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        ) : (
          <p className="truncate text-sm font-medium text-slate-900" title={step.name}>
            {step.name}
          </p>
        )}
        <p className="mt-0.5 text-[11px] font-medium text-brand-600">
          {isLast ? 'Final Step' : 'Next Step'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-0.5">
        {editing ? (
          <>
            <IconBtn title="Save" onClick={commit}>
              <CheckIcon />
            </IconBtn>
            <IconBtn title="Cancel" onClick={cancel}>
              <CloseIcon />
            </IconBtn>
          </>
        ) : (
          <>
            <IconBtn title="Edit step" onClick={() => setEditing(true)}>
              <EditIcon />
            </IconBtn>
            <IconBtn title="Delete step" danger onClick={() => onDelete(step.key)}>
              <TrashIcon />
            </IconBtn>
            <IconBtn
              title="Move up"
              onClick={() => onMove(step.key, -1)}
              disabled={isFirst}
            >
              <ArrowIcon up />
            </IconBtn>
            <IconBtn
              title="Move down"
              onClick={() => onMove(step.key, 1)}
              disabled={isLast}
            >
              <ArrowIcon up={false} />
            </IconBtn>
          </>
        )}
      </div>
    </div>
  );
}
