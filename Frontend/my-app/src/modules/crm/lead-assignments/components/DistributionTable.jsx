import { useMemo, useState } from 'react';
import { DISTRIBUTION_COLUMNS } from '../constants/assignmentColumns';
import { Skeleton } from '../../dashboard/components/Skeleton';

export function DistributionTable({ workload, loading }) {
  const [sortDir, setSortDir] = useState('desc'); // desc = highest first

  const rows = useMemo(() => {
    const sorted = [...(workload || [])].sort((a, b) =>
      sortDir === 'asc' ? a.total - b.total : b.total - a.total,
    );
    return sorted;
  }, [workload, sortDir]);

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-soft">
      <header className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Current Lead Distribution</p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Active workload per sales person
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          title={sortDir === 'desc' ? 'Sorted by highest leads' : 'Sorted by lowest leads'}
        >
          Sort {sortDir === 'desc' ? 'Highest ↓' : 'Lowest ↑'}
        </button>
      </header>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-slate-50">
            <tr>
              {DISTRIBUTION_COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading &&
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={`sk-${i}`}>
                  {DISTRIBUTION_COLUMNS.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <Skeleton className="h-4 w-24" />
                    </td>
                  ))}
                </tr>
              ))}

            {!loading && rows.length === 0 && (
              <tr>
                <td
                  colSpan={DISTRIBUTION_COLUMNS.length}
                  className="px-4 py-8 text-center text-xs text-slate-500"
                >
                  No sales person workload data yet.
                </td>
              </tr>
            )}

            {!loading &&
              rows.map((row) => (
                <tr key={row.userId} className="transition-colors hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-800">{row.name}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{row.total}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
