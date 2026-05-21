import { formatNumber, formatPercent } from '../../dashboard/utils/formatters';
import { Skeleton } from '../../dashboard/components/Skeleton';

const Icon = ({ d }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d={d} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Card = ({ label, value, hint, accent, icon, loading }) => (
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
        <p className="mt-1 truncate text-2xl font-semibold text-slate-900">{value}</p>
      )}
      {hint && !loading && <p className="mt-0.5 text-[11px] text-slate-500">{hint}</p>}
    </div>
  </div>
);

export function PerformanceCards({ performance, loading }) {
  const p = performance || {};
  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Card
        label="Total Enquiries"
        value={formatNumber(p.totalEnquiries ?? 0)}
        loading={loading}
        accent="bg-brand-100 text-brand-600"
        icon={<Icon d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H7l-4 3v-7.5A8.5 8.5 0 1 1 21 11.5Z" />}
      />
      <Card
        label="Qualified Enquiries"
        value={formatNumber(p.qualified ?? 0)}
        loading={loading}
        accent="bg-amber-50 text-amber-600"
        icon={<Icon d="M5 12.5 10 17l9-10" />}
      />
      <Card
        label="Converted Leads"
        value={formatNumber(p.converted ?? 0)}
        loading={loading}
        accent="bg-emerald-50 text-emerald-600"
        icon={<Icon d="m3 17 6-6 4 4 8-9M14 6h7v7" />}
      />
      <Card
        label="Overall Conversion"
        value={formatPercent(p.conversionRate ?? 0)}
        hint="Won ÷ Enquiries"
        loading={loading}
        accent="bg-brand-100 text-brand-600"
        icon={<Icon d="M12 3v18M3 12h18M7 8l5-5 5 5" />}
      />
    </section>
  );
}
