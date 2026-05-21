import { formatNumber } from '../../dashboard/utils/formatters';
import { Skeleton } from '../../dashboard/components/Skeleton';

const Icon = ({ d, className = '' }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d={d} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Card = ({ label, value, accent, icon, loading }) => (
  <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accent}`}>
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="truncate text-xs font-medium uppercase tracking-wider text-slate-500">
        {label}
      </p>
      {loading ? (
        <Skeleton className="mt-2 h-7 w-16" />
      ) : (
        <p className="mt-1 truncate text-2xl font-semibold text-slate-900">
          {formatNumber(value)}
        </p>
      )}
    </div>
  </div>
);

export function AssignmentKPIs({ totals, loading }) {
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Card
        label="Pending Assignment"
        value={totals.pending}
        loading={loading}
        accent="bg-amber-50 text-amber-600"
        icon={<Icon d="M12 7v5l3 2 M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z" />}
      />
      <Card
        label="Total Sales Persons"
        value={totals.totalSalesPersons}
        loading={loading}
        accent="bg-brand-100 text-brand-600"
        icon={<Icon d="M3 20a7 7 0 0 1 14 0M10 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />}
      />
      <Card
        label="Total Active Leads"
        value={totals.totalActive}
        loading={loading}
        accent="bg-emerald-50 text-emerald-600"
        icon={<Icon d="M3 7h18M3 12h12M3 17h7" />}
      />
    </section>
  );
}
