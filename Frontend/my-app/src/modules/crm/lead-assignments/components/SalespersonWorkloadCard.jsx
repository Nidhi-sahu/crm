export function SalespersonWorkloadCard({ workload, globalPending }) {
  if (!workload) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
        Select a sales person to see their workload.
      </div>
    );
  }

  const Stat = ({ label, value, tone }) => (
    <div className={`flex-1 rounded-lg p-3 ${tone}`}>
      <p className="text-[10px] font-medium uppercase tracking-wider opacity-70">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );

  return (
    <div className="rounded-xl border border-brand-200 bg-brand-50 p-3">
      <p className="text-xs font-medium text-slate-700">
        {workload.name || 'Workload'}
      </p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <Stat label="Active" value={workload.active || 0} tone="bg-white text-emerald-700" />
        <Stat
          label="Pending (global)"
          value={globalPending || 0}
          tone="bg-white text-amber-700"
        />
        <Stat label="Total Assigned" value={workload.total || 0} tone="bg-white text-brand-700" />
      </div>
    </div>
  );
}
