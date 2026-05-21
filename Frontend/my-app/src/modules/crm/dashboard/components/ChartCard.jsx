export function ChartCard({ title, subtitle, action, children, className = '' }) {
  return (
    <div
      className={`flex flex-col rounded-xl border border-slate-200 bg-white shadow-soft ${className}`.trim()}
    >
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="flex-1 p-5">{children}</div>
    </div>
  );
}
