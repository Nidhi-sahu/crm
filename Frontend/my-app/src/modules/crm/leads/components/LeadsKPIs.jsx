import { formatNumber } from '../../dashboard/utils/formatters';
import { Skeleton } from '../../dashboard/components/Skeleton';

const Icon = ({ d }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

export function LeadsKPIs({ totals, loading }) {
  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Card
        label="Total Leads"
        value={totals.total}
        loading={loading}
        accent="bg-brand-100 text-brand-600"
        icon={<Icon d="M3 7h18M3 12h12M3 17h7" />}
      />
      <Card
        label="Active Leads"
        value={totals.active}
        loading={loading}
        accent="bg-amber-50 text-amber-600"
        icon={<Icon d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3" />}
      />
      <Card
        label="Converted Leads"
        value={totals.converted}
        loading={loading}
        accent="bg-emerald-50 text-emerald-600"
        icon={<Icon d="M5 12.5 10 17l9-10" />}
      />
      <Card
        label="Dropped Leads"
        value={totals.dropped}
        loading={loading}
        accent="bg-rose-50 text-rose-600"
        icon={<Icon d="M6 6l12 12M18 6 6 18" />}
      />
    </section>
  );
}
