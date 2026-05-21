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
        <Skeleton className="mt-2 h-7 w-14" />
      ) : (
        <p className="mt-1 truncate text-2xl font-semibold text-slate-900">
          {formatNumber(value)}
        </p>
      )}
    </div>
  </div>
);

export function UserKPIs({ stats, loading }) {
  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Card
        label="Total Users"
        value={stats.total}
        loading={loading}
        accent="bg-brand-100 text-brand-600"
        icon={<Icon d="M3 20a7 7 0 0 1 14 0M10 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm9 8a5 5 0 0 0-3-4.5" />}
      />
      <Card
        label="Administrators"
        value={stats.administrators}
        loading={loading}
        accent="bg-rose-50 text-rose-600"
        icon={<Icon d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" />}
      />
      <Card
        label="Sales Person"
        value={stats.salesPersons}
        loading={loading}
        accent="bg-emerald-50 text-emerald-600"
        icon={<Icon d="M3 20a7 7 0 0 1 14 0M10 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />}
      />
      <Card
        label="Lead Generator"
        value={stats.leadGenerators}
        loading={loading}
        accent="bg-amber-50 text-amber-600"
        icon={<Icon d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H7l-4 3v-7.5A8.5 8.5 0 1 1 21 11.5Z" />}
      />
    </section>
  );
}
