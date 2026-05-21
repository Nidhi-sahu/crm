export function LeadStageBadge({ stage }) {
  if (!stage) return <span className="text-slate-300">—</span>;
  const name = stage.name || stage;
  const color = stage.color || '#8FCBFF';
  return (
    <span
      className="inline-flex max-w-[190px] items-center gap-1.5 text-[13px] font-medium text-slate-700"
      title={name}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ background: color }}
        aria-hidden="true"
      />
      <span className="truncate">{name}</span>
    </span>
  );
}
