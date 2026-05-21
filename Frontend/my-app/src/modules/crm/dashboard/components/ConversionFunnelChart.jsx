import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { ChartCard } from './ChartCard';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { formatNumber, formatPercent } from '../utils/formatters';

const renderTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-soft">
      <p className="font-medium text-slate-700">{label}</p>
      <p className="mt-0.5 text-slate-600">
        Count: <span className="font-semibold text-slate-900">{formatNumber(row.count)}</span>
      </p>
      <p className="text-slate-600">
        % of top: <span className="font-medium text-slate-800">{formatPercent(row.pctOfTop)}</span>
      </p>
      <p className="text-slate-600">
        Drop from prev:{' '}
        <span className="font-medium text-slate-800">{formatPercent(row.pctOfPrevious)}</span>
      </p>
    </div>
  );
};

const isPermissionError = (error) => {
  const code = error?.code;
  return code === 'FORBIDDEN' || code === 'UNAUTHORIZED';
};

export function ConversionFunnelChart({ section, onRetry }) {
  const { data, status, error } = section;
  const isLoading = status === 'loading' || status === 'idle';
  const isError = status === 'failed';
  const stages = data?.stages || [];
  const overall = data?.overallConversionRate || 0;
  const isEmpty = !isLoading && !isError && (!stages.length || stages.every((s) => s.count === 0));

  return (
    <ChartCard
      title="Lead Conversion Funnel"
      subtitle="Enquiries → Qualified → Leads → Won"
      className="h-full"
      action={
        !isLoading && !isError && stages.length > 0 ? (
          <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-[11px] font-medium text-brand-600">
            Overall {formatPercent(overall)}
          </span>
        ) : null
      }
    >
      <div className="h-72 w-full">
        {isLoading && <Skeleton className="h-full w-full" rounded="rounded-lg" />}

        {isError && isPermissionError(error) && (
          <EmptyState
            title="Restricted section"
            description="Your role does not have the report:view permission."
          />
        )}

        {isError && !isPermissionError(error) && (
          <ErrorState
            message={error?.message || 'Could not load conversion funnel.'}
            onRetry={onRetry}
          />
        )}

        {isEmpty && !isError && (
          <EmptyState
            title="No funnel data yet"
            description="Create enquiries and leads to see conversion."
          />
        )}

        {!isLoading && !isError && !isEmpty && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stages} margin={{ top: 12, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: '#64748B', fontSize: 12 }}
                axisLine={{ stroke: '#E2E8F0' }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: '#64748B', fontSize: 12 }}
                axisLine={{ stroke: '#E2E8F0' }}
                tickLine={false}
                width={36}
              />
              <Tooltip content={renderTooltip} cursor={{ stroke: '#BEE1FF' }} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#1278E6"
                strokeWidth={2.6}
                dot={{ r: 5, stroke: '#1278E6', strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </ChartCard>
  );
}
