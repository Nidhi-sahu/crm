import { Skeleton } from './Skeleton';

export function KPICard({ label, value, hint, icon, accent = 'bg-brand-100 text-brand-600', loading = false }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-soft sm:p-5">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accent}`}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium uppercase tracking-wider text-slate-500">
          {label}
        </p>
        {loading ? (
          <Skeleton className="mt-2 h-7 w-24" />
        ) : (
          <p className="mt-1 truncate text-2xl font-semibold text-slate-900">{value}</p>
        )}
        {hint && !loading && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      </div>
    </div>
  );
}
