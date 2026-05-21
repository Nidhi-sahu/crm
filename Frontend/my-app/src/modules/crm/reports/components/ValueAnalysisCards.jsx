import { formatNumber } from '../../dashboard/utils/formatters';
import { Skeleton } from '../../dashboard/components/Skeleton';

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});
const money = (n) => (Number.isFinite(Number(n)) ? inr.format(Number(n)) : '—');

const Card = ({ label, value, loading }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
    {loading ? (
      <Skeleton className="mt-2 h-7 w-24" />
    ) : (
      <p className="mt-1 truncate text-xl font-semibold text-slate-900">{value}</p>
    )}
  </div>
);

export function ValueAnalysisCards({ value, loading }) {
  const v = value || {};
  return (
    <section className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">
        Value Analysis
      </p>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card label="Total Actual Value" value={money(v.totalValue)} loading={loading} />
        <Card label="Average Sale Value" value={money(v.avgValue)} loading={loading} />
        <Card label="Deals Closed" value={formatNumber(v.dealsClosed ?? 0)} loading={loading} />
        <Card
          label="Avg Completion"
          value={v.avgCompletionDays ? `${v.avgCompletionDays} days` : '—'}
          loading={loading}
        />
      </div>
    </section>
  );
}
