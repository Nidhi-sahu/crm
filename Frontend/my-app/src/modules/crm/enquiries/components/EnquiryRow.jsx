import { useRef, useState, useEffect, cloneElement } from 'react';
import { formatDate, formatDateTime, isOverdue, initialsOf } from '../utils/enquiryFormatters';
import {
  backendToUiStatus,
  uiStatusLabel,
  uiStatusTone,
  UI_STATUS,
} from '../constants/enquiryStatuses';
import { ENQUIRY_COLUMNS as DEFAULT_COLUMNS } from '../constants/enquiryColumns';

const TONE_CLASSES = {
  amber: 'bg-amber-50 text-amber-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  rose: 'bg-rose-50 text-rose-700',
  slate: 'bg-slate-100 text-slate-700',
  brand: 'bg-brand-100 text-brand-600',
};

const StatusChip = ({ value }) => {
  const cls = TONE_CLASSES[uiStatusTone(value)] || TONE_CLASSES.slate;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px] font-medium ${cls}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
      {uiStatusLabel(value)}
    </span>
  );
};

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

const QuestionIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
    <path
      d="M9.5 9.5a2.5 2.5 0 0 1 5 0c0 1.4-1.5 1.8-2.2 2.5-.4.4-.5.8-.5 1.5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    <circle cx="12" cy="17" r="0.9" fill="currentColor" />
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
    <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const fullDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const isEdited = (enquiry) => {
  if (!enquiry?.updatedAt || !enquiry?.createdAt) return false;
  return new Date(enquiry.updatedAt).getTime() - new Date(enquiry.createdAt).getTime() > 60000;
};

function TimestampPopover({ enquiry }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const edited = isEdited(enquiry);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-[13px] text-brand-600 hover:text-brand-700 hover:underline"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <ClockIcon /> View
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1.5 w-64 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-card">
          <div className="border-b border-slate-100 bg-slate-50 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Timestamps
            </p>
          </div>
          <div className="space-y-2.5 p-3">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Created
              </p>
              <p className="mt-0.5 text-[13px] text-slate-800">
                {fullDateTime(enquiry.createdAt)}
              </p>
              {enquiry.createdBy?.name && (
                <p className="mt-0.5 text-[11px] text-slate-500">
                  by{' '}
                  <span className="font-medium text-slate-700">{enquiry.createdBy.name}</span>
                </p>
              )}
            </div>
            <div className="h-px bg-slate-100" />
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Last Updated
              </p>
              <p className="mt-0.5 text-[13px] text-slate-800">
                {edited ? fullDateTime(enquiry.updatedAt) : 'Never edited'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function EnquiryRow({ enquiry, columns = DEFAULT_COLUMNS, onView, onQualify }) {
  const uiStatus = backendToUiStatus(enquiry.status);
  const showQualify = uiStatus === UI_STATUS.PENDING;

  const renderCell = (key) => {
    switch (key) {
      case 'date':
        return (
          <Cell className="whitespace-nowrap">
            {formatDate(enquiry.dateOfEnquiry || enquiry.createdAt)}
          </Cell>
        );
      case 'clientName':
        return (
          <Cell>
            <button
              type="button"
              onClick={() => onView?.(enquiry)}
              className="flex items-center gap-2.5 text-left"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-200 text-[13px] font-semibold text-slate-800">
                {initialsOf(enquiry.clientName)}
              </span>
              <span className="block max-w-[180px] truncate text-[13px] font-medium text-slate-900 hover:text-brand-600">
                {enquiry.clientName || '—'}
              </span>
            </button>
          </Cell>
        );
      case 'companyName':
        return <Cell>{enquiry.companyName}</Cell>;
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
      case 'status':
        return (
          <Cell>
            <div className="flex flex-col items-start gap-1">
              <StatusChip value={uiStatus} />
              {enquiry.previouslyQualified && (
                <span
                  className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700"
                  title="Was qualified but had no visit date — moved back to Pending"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
                  Previously Qualified
                </span>
              )}
            </div>
          </Cell>
        );
      case 'createdBy':
        return <Cell>{enquiry.createdBy?.name || '—'}</Cell>;
      case 'followup':
        return (
          <Cell className="whitespace-nowrap">
            {enquiry.nextFollowupAt ? (
              <span
                className={`inline-flex items-center gap-1.5 ${
                  isOverdue(enquiry.nextFollowupAt) ? 'text-rose-600' : 'text-slate-700'
                }`}
              >
                {formatDateTime(enquiry.nextFollowupAt, enquiry.followupTime)}
                {isOverdue(enquiry.nextFollowupAt) && (
                  <span className="rounded-full bg-rose-50 px-1.5 py-0.5 text-[13px] font-semibold text-rose-600">
                    overdue
                  </span>
                )}
              </span>
            ) : (
              <span className="text-slate-300">—</span>
            )}
          </Cell>
        );
      case 'remarks':
        return (
          <Cell>
            {enquiry.remarks ? (
              <span className="block max-w-[200px] truncate" title={enquiry.remarks}>
                {enquiry.remarks}
              </span>
            ) : (
              <span className="text-slate-300">—</span>
            )}
          </Cell>
        );
      case 'timestamp':
        return (
          <Cell>
            <TimestampPopover enquiry={enquiry} />
          </Cell>
        );
      case 'actions':
        return (
          <Cell className="text-right">
            <div className="inline-flex items-center gap-1">
              <button
                type="button"
                title="View details"
                aria-label="View details"
                onClick={() => onView?.(enquiry)}
                className="rounded-md p-1.5 text-slate-500 hover:bg-brand-100 hover:text-brand-600"
              >
                <EyeIcon />
              </button>
              {showQualify && (
                <button
                  type="button"
                  title="Start qualification"
                  aria-label="Start qualification"
                  onClick={() => onQualify?.(enquiry)}
                  className="rounded-md p-1.5 text-slate-500 hover:bg-brand-100 hover:text-brand-600"
                >
                  <QuestionIcon />
                </button>
              )}
            </div>
          </Cell>
        );
      default:
        // custom / unknown columns have no backing data yet
        return <Cell />;
    }
  };

  return (
    <tr className="transition-colors hover:bg-slate-50">
      {columns.map((col) => cloneElement(renderCell(col.key), { key: col.key }))}
    </tr>
  );
}
