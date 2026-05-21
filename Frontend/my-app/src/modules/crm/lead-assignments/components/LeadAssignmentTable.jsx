import { LEAD_COLUMNS } from '../constants/assignmentColumns';
import { LeadAssignmentRow } from './LeadAssignmentRow';
import { Skeleton } from '../../dashboard/components/Skeleton';

export function LeadAssignmentTable({
  leads,
  isLoading,
  isEmpty,
  onAssign,
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft">
      <header className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Qualified Leads</p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Assign to your sales team — only qualified leads listed
          </p>
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-slate-50">
            <tr>
              {LEAD_COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={`whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 ${
                    col.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`sk-${i}`}>
                  {LEAD_COLUMNS.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <Skeleton className="h-4 w-full max-w-[120px]" />
                    </td>
                  ))}
                </tr>
              ))}

            {!isLoading && isEmpty && (
              <tr>
                <td colSpan={LEAD_COLUMNS.length} className="px-4 py-10 text-center">
                  <p className="text-sm font-medium text-slate-700">
                    No qualified leads yet
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Qualify an enquiry from the Enquiries page to create a lead.
                  </p>
                </td>
              </tr>
            )}

            {!isLoading && !isEmpty &&
              leads.map((lead) => (
                <LeadAssignmentRow
                  key={lead._id}
                  lead={lead}
                  onAssign={onAssign}
                />
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
