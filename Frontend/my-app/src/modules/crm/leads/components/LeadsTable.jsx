import { LEAD_COLUMNS } from '../constants/leadColumns';
import { LeadRow } from './LeadRow';
import { Skeleton } from '../../dashboard/components/Skeleton';

export function LeadsTable({
  leads,
  stages,
  visibleKeys,
  isLoading,
  isEmpty,
  onView,
  onComment,
}) {
  const visibleColumns = LEAD_COLUMNS.filter((c) => visibleKeys.includes(c.key));

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-slate-50">
            <tr>
              {visibleColumns.map((col) => (
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
                  {visibleColumns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <Skeleton className="h-4 w-full max-w-[120px]" />
                    </td>
                  ))}
                </tr>
              ))}

            {!isLoading && isEmpty && (
              <tr>
                <td colSpan={visibleColumns.length} className="px-4 py-12 text-center">
                  <p className="text-sm font-medium text-slate-700">No leads yet</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Assign a qualified lead from the Lead Assignment page.
                  </p>
                </td>
              </tr>
            )}

            {!isLoading && !isEmpty &&
              leads.map((lead) => (
                <LeadRow
                  key={lead._id}
                  lead={lead}
                  stages={stages}
                  visibleKeys={visibleKeys}
                  onView={onView}
                  onComment={onComment}
                />
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
