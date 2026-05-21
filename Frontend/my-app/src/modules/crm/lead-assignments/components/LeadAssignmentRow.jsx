const Cell = ({ children, className = '' }) => (
  <td className={`px-4 py-3 align-middle text-[13px] text-slate-700 ${className}`.trim()}>
    {children || <span className="text-slate-300">—</span>}
  </td>
);

const shortCode = (id, prefix) => {
  if (!id) return '—';
  return `${prefix}-${String(id).slice(-6).toUpperCase()}`;
};

const initials = (name = '') =>
  name
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('') || '?';

const StageChip = ({ stage }) => {
  if (!stage) return <span className="text-slate-300">—</span>;
  const name = stage.name || stage;
  const color = stage.color || '#8FCBFF';
  return (
    <span
      className="inline-flex max-w-[180px] items-center gap-1.5 text-[13px] font-medium text-slate-700"
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
};

export function LeadAssignmentRow({ lead, onAssign }) {
  const enquiry = lead.enquiryId || {};

  return (
    <tr className="transition-colors hover:bg-slate-50">
      <Cell className="whitespace-nowrap font-mono">
        {shortCode(enquiry._id || lead.enquiryId, 'ENQ')}
      </Cell>
      <Cell>
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-200 text-xs font-semibold text-slate-800">
            {initials(enquiry.clientName)}
          </span>
          <span
            className="block max-w-[150px] truncate font-medium text-slate-900"
            title={enquiry.clientName}
          >
            {enquiry.clientName || '—'}
          </span>
        </div>
      </Cell>
      <Cell>{enquiry.companyName}</Cell>
      <Cell className="whitespace-nowrap">{enquiry.clientPhone}</Cell>
      <Cell>
        <span className="block max-w-[180px] truncate" title={enquiry.clientEmail}>
          {enquiry.clientEmail}
        </span>
      </Cell>
      <Cell>
        <span
          className="block max-w-[220px] truncate"
          title={enquiry.requirement || lead.requirement}
        >
          {enquiry.requirement || lead.requirement}
        </span>
      </Cell>
      <Cell>
        <StageChip stage={lead.currentStageId} />
      </Cell>
      <Cell className="text-right">
        <button
          type="button"
          onClick={() => onAssign?.(lead)}
          className="rounded-md bg-brand-500 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-brand-600"
        >
          Assign
        </button>
      </Cell>
    </tr>
  );
}
