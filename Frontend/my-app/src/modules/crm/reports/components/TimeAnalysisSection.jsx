import { Skeleton } from '../../dashboard/components/Skeleton';

const hoursLabel = (h) => {
  if (!Number.isFinite(Number(h)) || h <= 0) return '—';
  if (h < 24) return `${Number(h).toFixed(1)} hrs`;
  return `${(h / 24).toFixed(1)} days`;
};

const StageCard = ({ stage }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
    <p className="truncate text-sm font-semibold text-slate-900" title={stage.stageName}>
      {stage.stageName}
    </p>
    <div className="mt-3 space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">Average Time</span>
        <span className="font-medium text-slate-800">
          {stage.avgDays > 0 ? `${stage.avgDays} days` : hoursLabel(stage.avgHours)}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">Fastest</span>
        <span className="font-medium text-emerald-600">{hoursLabel(stage.minHours)}</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">Slowest</span>
        <span className="font-medium text-rose-600">{hoursLabel(stage.maxHours)}</span>
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 pt-1.5 text-xs">
        <span className="text-slate-500">Total Completions</span>
        <span className="rounded-full bg-brand-100 px-2 py-0.5 font-semibold text-brand-700">
          {stage.sampleCount}
        </span>
      </div>
    </div>
  </div>
);

export function TimeAnalysisSection({ time, loading }) {
  return (
    <section className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">
        Time Analysis
      </p>
      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full" rounded="rounded-xl" />
          ))}
        </div>
      ) : !time || time.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-sm font-medium text-slate-700">No stage timing data yet</p>
          <p className="mt-1 text-xs text-slate-500">
            Time analysis appears once leads move through stages.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {time.map((stage) => (
            <StageCard key={stage.stageName} stage={stage} />
          ))}
        </div>
      )}
    </section>
  );
}
