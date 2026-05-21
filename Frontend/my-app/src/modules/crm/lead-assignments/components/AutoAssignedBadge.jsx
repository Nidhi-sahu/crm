const formatTime = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function AutoAssignedBadge({ assignment }) {
  if (!assignment) return null;
  const isAuto = assignment.triggerType === 'auto' || assignment.autoAssigned;

  if (!isAuto) {
    return (
      <span className="inline-flex flex-col items-start gap-0.5 text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
          Manually Assigned
        </span>
        {assignment.createdAt && (
          <span className="text-[10px]">{formatTime(assignment.createdAt)}</span>
        )}
      </span>
    );
  }

  return (
    <span className="inline-flex flex-col items-start gap-0.5 text-[11px] text-slate-500">
      <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2 py-0.5 font-medium text-brand-700">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="m13 2-3 7h5l-3 7M5 12a7 7 0 1 0 14 0 7 7 0 0 0-14 0Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Auto Assigned
      </span>
      <span className="text-[10px]">
        By System · {formatTime(assignment.createdAt)}
      </span>
    </span>
  );
}
