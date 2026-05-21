import { ENQUIRY_COLUMNS } from '../constants/enquiryColumns';
import { EnquiryRow } from './EnquiryRow';
import { EnquiryTableSkeletonRows } from './EnquiryTableSkeleton';
import { EnquiryEmptyState } from './EnquiryEmptyState';

const SortIcon = ({ direction }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className={`transition-transform ${direction === 'asc' ? 'rotate-180' : ''}`}
  >
    <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function HeaderCell({ column, sort, onSort }) {
  const isSorted = column.sortable && sort?.sortBy === column.sortKey;
  const align = column.align === 'right' ? 'text-right' : 'text-left';
  return (
    <th
      scope="col"
      className={`sticky top-0 z-10 whitespace-nowrap bg-slate-50 px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 ${align}`}
    >
      {column.sortable ? (
        <button
          type="button"
          onClick={() =>
            onSort({
              sortBy: column.sortKey,
              sortOrder: isSorted && sort.sortOrder === 'desc' ? 'asc' : 'desc',
            })
          }
          className="inline-flex items-center gap-1 uppercase hover:text-slate-700"
        >
          {column.label}
          {isSorted && <SortIcon direction={sort.sortOrder} />}
        </button>
      ) : (
        column.label
      )}
    </th>
  );
}

export function EnquiryTable({
  items,
  isLoading,
  isEmpty,
  filtersActive,
  sort,
  onSort,
  onView,
  onQualify,
  onAdd,
  onResetFilters,
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              {ENQUIRY_COLUMNS.map((col) => (
                <HeaderCell key={col.key} column={col} sort={sort} onSort={onSort} />
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && <EnquiryTableSkeletonRows />}

            {!isLoading && !isEmpty &&
              items.map((row) => (
                <EnquiryRow
                  key={row._id}
                  enquiry={row}
                  onView={onView}
                  onQualify={onQualify}
                />
              ))}

            {!isLoading && isEmpty && (
              <tr>
                <td colSpan={ENQUIRY_COLUMNS.length} className="p-0">
                  <EnquiryEmptyState
                    filtersActive={filtersActive}
                    onReset={onResetFilters}
                    onAdd={onAdd}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
