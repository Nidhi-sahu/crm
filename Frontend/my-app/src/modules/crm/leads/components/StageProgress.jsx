const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 12.5 10 17l9-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UndoIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M9 14 4 9l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 9h11a5 5 0 0 1 0 10h-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function StageProgress({
  stages,
  currentStage,
  nextStage,
  canUndo,
  onUndo,
  undoing,
}) {
  const ordered = [...(stages || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
  const currentId = currentStage?._id || currentStage;
  const currentOrder =
    ordered.find((s) => String(s._id) === String(currentId))?.order ?? -1;

  if (ordered.length === 0) {
    return <p className="text-xs text-slate-400">No stages configured.</p>;
  }

  return (
    <div className="space-y-3">
      {/* Stepper */}
      <div className="overflow-x-auto pb-1">
        <ol className="flex min-w-max items-start">
          {ordered.map((stage, idx) => {
            const isDone = stage.order < currentOrder;
            const isCurrent = String(stage._id) === String(currentId);
            const isLast = idx === ordered.length - 1;

            const dotClass = isDone
              ? 'bg-brand-500 text-white border-brand-500'
              : isCurrent
              ? 'bg-white text-brand-600 border-brand-500 ring-2 ring-brand-200'
              : 'bg-white text-slate-300 border-slate-300';

            const lineClass = stage.order < currentOrder ? 'bg-brand-400' : 'bg-slate-200';

            return (
              <li key={stage._id} className="flex flex-col items-center" style={{ minWidth: 78 }}>
                <div className="flex w-full items-center">
                  <span className="h-0.5 flex-1 bg-transparent" />
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold ${dotClass}`}
                  >
                    {isDone ? <CheckIcon /> : idx + 1}
                  </span>
                  {!isLast ? (
                    <span className={`h-0.5 flex-1 ${lineClass}`} />
                  ) : (
                    <span className="h-0.5 flex-1 bg-transparent" />
                  )}
                </div>
                <span
                  className={`mt-1 px-1 text-center text-[10px] leading-tight ${
                    isCurrent
                      ? 'font-semibold text-brand-700'
                      : isDone
                      ? 'text-slate-600'
                      : 'text-slate-400'
                  }`}
                >
                  {stage.name}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Current → Next + Undo */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
        <p className="text-xs text-slate-600">
          <span className="text-slate-400">Current:</span>{' '}
          <span className="font-semibold text-slate-800">
            {currentStage?.name || '—'}
          </span>
          {nextStage && (
            <>
              <span className="mx-1.5 text-slate-300">→</span>
              <span className="text-slate-400">Next:</span>{' '}
              <span className="font-medium text-slate-700">{nextStage.name}</span>
            </>
          )}
        </p>
        {canUndo && (
          <button
            type="button"
            onClick={onUndo}
            disabled={undoing}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
          >
            <UndoIcon />
            Undo Stage
          </button>
        )}
      </div>
    </div>
  );
}
