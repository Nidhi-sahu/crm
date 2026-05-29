import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { ChartCard } from './ChartCard';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { colorAt } from '../utils/colorPalette';
import { formatNumber } from '../utils/formatters';

// Only these sources are shown in the distribution (fixed buckets).
const FIXED_SOURCES = [
  ['broker', 'Broker'],
  ['self', 'Self'],
  ['metaAds', 'Meta Ads'],
  ['reference', 'Reference'],
  ['walkIn', 'Walk-in'],
];

const renderTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-soft">
      <p className="font-medium text-slate-700">{item.name}</p>
      <p className="mt-0.5 text-slate-600">
        Leads: <span className="font-semibold text-slate-900">{formatNumber(item.value)}</span>
      </p>
    </div>
  );
};

export function LeadSourceChart({ section, onRetry }) {
  const { data, status, error } = section;
  const isLoading = status === 'loading' || status === 'idle';
  const isError = status === 'failed';
  const isEmpty = !isLoading && !isError && (!data || data.length === 0);

  // Count every entry from a source (enquiries), so it reflects as soon as
  // a lead/enquiry is added — not only after it is qualified into a Lead.
  const bySource = Object.fromEntries(
    (data || []).map((r) => [r.source, r.enquiryCount ?? r.totalLeads ?? 0]),
  );
  const chartData = FIXED_SOURCES.map(([value, label]) => ({
    name: label,
    value: bySource[value] || 0,
  }));

  const total = chartData.reduce((s, r) => s + r.value, 0);

  return (
    <ChartCard
      title="Lead Source Distribution"
      subtitle="Share of leads by acquisition source"
      className="h-full"
    >
      <div className="h-72 w-full">
        {isLoading && <Skeleton className="h-full w-full" rounded="rounded-lg" />}

        {isError && (
          <ErrorState
            message={error?.message || 'Could not load source breakdown.'}
            onRetry={onRetry}
          />
        )}

        {isEmpty && (
          <EmptyState
            title="No source data"
            description="Lead source mix will appear here once leads are created."
          />
        )}

        {!isLoading && !isError && !isEmpty && (
          <div className="grid h-full grid-cols-1 gap-3 sm:grid-cols-[1fr,1fr]">
            <div className="relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={88}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    {chartData.map((entry, i) => (
                      <Cell key={entry.name} fill={colorAt(i)} />
                    ))}
                  </Pie>
                  <Tooltip content={renderTooltip} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-slate-500">Total leads</span>
                <span className="text-xl font-semibold text-slate-900">
                  {formatNumber(total)}
                </span>
              </div>
            </div>
            <ul className="flex flex-col justify-center gap-2 self-center text-sm">
              {chartData.map((entry, i) => {
                const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0.0';
                return (
                  <li key={entry.name} className="flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2 text-slate-700">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: colorAt(i) }}
                      />
                      <span className="truncate">{entry.name}</span>
                    </span>
                    <span className="text-xs font-medium text-slate-900">
                      {formatNumber(entry.value)}{' '}
                      <span className="text-slate-400">· {pct}%</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </ChartCard>
  );
}
