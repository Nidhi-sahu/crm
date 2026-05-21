import { Skeleton } from '../../dashboard/components/Skeleton';
import { formatNumber, formatPercent } from '../../dashboard/utils/formatters';

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const initials = (name = '') =>
  name
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('') || '?';

const Th = ({ children, right }) => (
  <th
    className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 ${
      right ? 'text-right' : 'text-left'
    }`}
  >
    {children}
  </th>
);

const Td = ({ children, right }) => (
  <td className={`px-4 py-3 text-sm text-slate-700 ${right ? 'text-right' : ''}`}>{children}</td>
);

export function TeamComparisonTable({ scorecard, loading }) {
  return (
    <section className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">
        Team Comparison
      </p>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <Th>Sales Person</Th>
                <Th right>Total Leads</Th>
                <Th right>Won</Th>
                <Th right>Lost</Th>
                <Th right>Win Rate</Th>
                <Th right>Revenue</Th>
                <Th right>Avg Close</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-full max-w-[100px]" />
                      </td>
                    ))}
                  </tr>
                ))}

              {!loading && (!scorecard || scorecard.length === 0) && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                    No salesperson data for this range.
                  </td>
                </tr>
              )}

              {!loading &&
                scorecard?.map((r) => (
                  <tr key={r.userId} className="hover:bg-slate-50">
                    <Td>
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-200 text-xs font-semibold text-slate-800">
                          {initials(r.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900">{r.name}</p>
                          {r.role && (
                            <p className="truncate text-[11px] text-slate-500">{r.role}</p>
                          )}
                        </div>
                      </div>
                    </Td>
                    <Td right>{formatNumber(r.total)}</Td>
                    <Td right>{formatNumber(r.won)}</Td>
                    <Td right>{formatNumber(r.lost)}</Td>
                    <Td right>
                      <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-600">
                        {formatPercent(r.winRate)}
                      </span>
                    </Td>
                    <Td right>
                      <span className="font-medium text-slate-900">{inr.format(r.revenue)}</span>
                    </Td>
                    <Td right>{r.avgCompletionDays > 0 ? `${r.avgCompletionDays}d` : '—'}</Td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
