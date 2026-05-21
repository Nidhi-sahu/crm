import { USER_COLUMNS } from '../constants/userColumns';
import { UserRow } from './UserRow';
import { Skeleton } from '../../dashboard/components/Skeleton';

const COLUMN_MAP = Object.fromEntries(USER_COLUMNS.map((c) => [c.key, c]));

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

export function UsersTable({
  users,
  order,
  hiddenKeys,
  sort,
  onSort,
  isLoading,
  isEmpty,
  canEdit,
  onEdit,
}) {
  const visibleCols = order
    .filter((k) => !hiddenKeys.includes(k))
    .map((k) => COLUMN_MAP[k])
    .filter(Boolean);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-slate-50">
            <tr>
              {visibleCols.map((col) => {
                const isSorted = col.sortable && sort?.sortBy === col.sortKey;
                return (
                  <th
                    key={col.key}
                    className={`whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 ${
                      col.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() =>
                          onSort({
                            sortBy: col.sortKey,
                            sortOrder: isSorted && sort.sortOrder === 'asc' ? 'desc' : 'asc',
                          })
                        }
                        className="inline-flex items-center gap-1 uppercase hover:text-slate-700"
                      >
                        {col.label}
                        {isSorted && <SortIcon direction={sort.sortOrder} />}
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`sk-${i}`}>
                  {visibleCols.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <Skeleton className="h-4 w-full max-w-[140px]" />
                    </td>
                  ))}
                </tr>
              ))}

            {!isLoading && isEmpty && (
              <tr>
                <td colSpan={visibleCols.length} className="px-4 py-12 text-center">
                  <p className="text-sm font-medium text-slate-700">No users found</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Try a different search, or add a new user.
                  </p>
                </td>
              </tr>
            )}

            {!isLoading && !isEmpty &&
              users.map((user) => (
                <UserRow
                  key={user._id}
                  user={user}
                  order={order}
                  hiddenKeys={hiddenKeys}
                  canEdit={canEdit}
                  onEdit={onEdit}
                />
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
