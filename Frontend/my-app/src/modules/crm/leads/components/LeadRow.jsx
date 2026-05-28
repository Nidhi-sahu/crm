import { cloneElement } from 'react';
import { LeadStageBadge } from './LeadStageBadge';
import { LeadStatusBadge } from './LeadStatusBadge';
import { formatDate, formatINRCompact, initialsOf, shortCode } from '../utils/leadFormatters';
import { LEAD_COLUMNS } from '../constants/leadColumns';

const Cell = ({ children, className = '' }) => (
  <td className={`px-4 py-3 align-middle text-[13px] text-slate-700 ${className}`.trim()}>
    {children || <span className="text-slate-300">—</span>}
  </td>
);

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

const ChatIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M4 5h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H8l-4 3V6a1 1 0 0 1 1-1Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

const findNextStage = (lead, stages) => {
  const stage = lead.currentStageId;
  if (!stage) return null;
  const allowedIds = stage.allowedNextStages || [];
  if (allowedIds.length > 0) {
    const next = stages.find((s) => String(s._id) === String(allowedIds[0]));
    if (next) return next;
  }
  // fallback: next by order
  const ordered = stages.filter((s) => Number.isFinite(s.order));
  const cur = ordered.find((s) => String(s._id) === String(stage._id || stage));
  if (!cur) return null;
  return ordered.find((s) => s.order === cur.order + 1) || null;
};

export function LeadRow({ lead, stages, visibleKeys, onView, onComment }) {
  const enquiry = lead.enquiryId || {};
  const nextStage = findNextStage(lead, stages);

  const renderCell = (key) => {
    switch (key) {
      case 'enquiryId':
        return (
          <Cell className="whitespace-nowrap font-mono">
            {shortCode(enquiry._id || lead.enquiryId, 'ENQ')}
          </Cell>
        );
      case 'assignedTo':
        return (
          <Cell>
            {lead.assignedTo ? (
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[10px] font-semibold text-brand-600">
                  {initialsOf(lead.assignedTo.name)}
                </span>
                <span className="truncate text-[13px] text-slate-700">
                  {lead.assignedTo.name || lead.assignedTo.email}
                </span>
              </div>
            ) : (
              <span className="text-slate-300">Unassigned</span>
            )}
          </Cell>
        );
      case 'clientName':
        return (
          <Cell>
            <button
              type="button"
              onClick={() => onView?.(lead)}
              className="flex items-center gap-2.5 text-left"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-200 text-xs font-semibold text-slate-800">
                {initialsOf(enquiry.clientName)}
              </span>
              <span
                className="block max-w-[160px] truncate text-[13px] font-medium text-slate-900 hover:text-brand-600"
                title={enquiry.clientName}
              >
                {enquiry.clientName || '—'}
              </span>
            </button>
          </Cell>
        );
      case 'companyName':
        return <Cell key="company">{enquiry.companyName}</Cell>;
      case 'clientPhone':
        return <Cell className="whitespace-nowrap">{enquiry.clientPhone}</Cell>;
      case 'clientEmail':
        return (
          <Cell>
            <span className="block max-w-[180px] truncate" title={enquiry.clientEmail}>
              {enquiry.clientEmail}
            </span>
          </Cell>
        );
      case 'currentStage':
        return (
          <Cell>
            <LeadStageBadge stage={lead.currentStageId} />
          </Cell>
        );
      case 'nextStage':
        return (
          <Cell>
            {nextStage ? <LeadStageBadge stage={nextStage} /> : <span className="text-slate-300">—</span>}
          </Cell>
        );
      case 'plannedDate':
        return <Cell className="whitespace-nowrap">{formatDate(lead.plannedStageAt)}</Cell>;
      case 'actualDate':
        return <Cell className="whitespace-nowrap">{formatDate(lead.actualStageAt)}</Cell>;
      case 'actualValue':
        return (
          <Cell className="whitespace-nowrap font-medium text-slate-900">
            {formatINRCompact(lead.actualValue)}
          </Cell>
        );
      case 'status':
        return (
          <Cell>
            <LeadStatusBadge status={lead.status} />
          </Cell>
        );
      case 'action':
        return (
          <Cell className="text-right">
            <div className="inline-flex items-center gap-1">
              <button
                type="button"
                title="View details"
                aria-label="View details"
                onClick={() => onView?.(lead)}
                className="rounded-md p-1.5 text-slate-500 hover:bg-brand-100 hover:text-brand-600"
              >
                <EyeIcon />
              </button>
              <button
                type="button"
                title="Comments"
                aria-label="Comments"
                onClick={() => onComment?.(lead)}
                className="rounded-md p-1.5 text-slate-500 hover:bg-brand-100 hover:text-brand-600"
              >
                <ChatIcon />
              </button>
            </div>
          </Cell>
        );
      default:
        return <Cell />;
    }
  };

  return (
    <tr className="transition-colors hover:bg-slate-50">
      {LEAD_COLUMNS.filter((c) => visibleKeys.includes(c.key)).map((col) =>
        cloneElement(renderCell(col.key), { key: col.key }),
      )}
    </tr>
  );
}
