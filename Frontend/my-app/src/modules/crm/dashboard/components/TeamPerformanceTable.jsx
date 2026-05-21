import { useMemo, useState } from 'react';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { formatNumber, formatPercent, formatCurrencyINR } from '../utils/formatters';
import { TEAM_PAGE_SIZE } from '../constants/dashboardConfig';

const initials = (name = '') =>
  name
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('') || '?';

const HeaderCell = ({ children, className = '' }) => (
  <th
    scope="col"
    className={`px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 ${className}`.trim()}
  >
    {children}
  </th>
);

const Cell = ({ children, className = '' }) => (
  <td className={`px-4 py-3 align-middle text-sm text-slate-700 ${className}`.trim()}>
    {children}
  </td>
);

export function TeamPerformanceTable({ section, onRetry, pageSize = TEAM_PAGE_SIZE }) {
  const { data, status, error } = section;
  const [page, setPage] = useState(1);

  const isLoading = status === 'loading' || status === 'idle';
  const isError = status === 'failed';
  const rows = Array.isArray(data) ? data : [];
  const totalRows = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const pageRows = useMemo(() => rows.slice(start, start + pageSize), [rows, start, pageSize]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-soft">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">Team Performance</p>
          <p className="mt-0.5 text-xs text-slate-500">
            Salesperson-level leads, wins, conversion and revenue
          </p>
        </div>
        {!isLoading && !isError && (
          <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-[11px] font-medium text-brand-600">
            {totalRows} member{totalRows === 1 ? '' : 's'}
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-slate-50">
            <tr>
              <HeaderCell>Sales Person</HeaderCell>
              <HeaderCell className="text-right">Total Leads</HeaderCell>
              <HeaderCell className="text-right">Converted</HeaderCell>
              <HeaderCell className="text-right">Conversion Rate</HeaderCell>
              <HeaderCell className="text-right">Total Value</HeaderCell>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading &&
              Array.from({ length: pageSize }).map((_, i) => (
                <tr key={`sk-${i}`}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <Skeleton className="h-4 w-full max-w-[120px]" />
                    </td>
                  ))}
                </tr>
              ))}

            {!isLoading && !isError && pageRows.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <EmptyState
                    title="No team data"
                    description="Salesperson performance will appear once leads are assigned."
                  />
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              pageRows.map((row) => (
                <tr key={row.userId} className="transition-colors hover:bg-slate-50">
                  <Cell>
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-200 text-xs font-semibold text-slate-800">
                        {initials(row.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{row.name}</p>
                        {row.email && (
                          <p className="truncate text-[11px] text-slate-500">{row.email}</p>
                        )}
                      </div>
                    </div>
                  </Cell>
                  <Cell className="text-right font-medium text-slate-900">
                    {formatNumber(row.total)}
                  </Cell>
                  <Cell className="text-right">{formatNumber(row.won)}</Cell>
                  <Cell className="text-right">
                    <span className="inline-flex items-center rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-600">
                      {formatPercent(row.conversionRate)}
                    </span>
                  </Cell>
                  <Cell className="text-right font-medium text-slate-900">
                    {formatCurrencyINR(row.totalRevenue)}
                  </Cell>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {isError && (
        <div className="border-t border-slate-100">
          <ErrorState message={error?.message || 'Could not load team performance.'} onRetry={onRetry} />
        </div>
      )}

      {!isLoading && !isError && totalRows > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 sm:flex-row">
          <p className="text-xs text-slate-500">
            Showing {start + 1}–{Math.min(start + pageSize, totalRows)} of {totalRows}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-2 text-xs text-slate-600">
              Page {safePage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
