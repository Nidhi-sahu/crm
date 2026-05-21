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

const formatDateTick = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-soft">
      <p className="font-medium text-slate-700">{formatDateTick(label)}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="mt-0.5 text-slate-600">
          <span
            className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle"
            style={{ background: entry.color }}
          />
          <span className="capitalize">{entry.dataKey}</span>:{' '}
          <span className="font-medium text-slate-900">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

export function EnquiryTrendsChart({ section, onRetry }) {
  const { data, status, error } = section;
  const isLoading = status === 'loading' || status === 'idle';
  const isError = status === 'failed';
  const isEmpty = !isLoading && !isError && (!data || data.length === 0);

  return (
    <ChartCard
      title="Enquiry Trends"
      subtitle="New enquiries over the last 30 days"
      className="h-full"
    >
      <div className="h-72 w-full">
        {isLoading && <Skeleton className="h-full w-full" rounded="rounded-lg" />}

        {isError && (
          <ErrorState
            message={error?.message || 'Trends endpoint unavailable.'}
            onRetry={onRetry}
          />
        )}

        {isEmpty && (
          <EmptyState
            title="No trend data yet"
            description="Daily enquiry counts will appear here once available."
          />
        )}

        {!isLoading && !isError && !isEmpty && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDateTick}
                tick={{ fill: '#64748B', fontSize: 12 }}
                axisLine={{ stroke: '#E2E8F0' }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: '#64748B', fontSize: 12 }}
                axisLine={{ stroke: '#E2E8F0' }}
                tickLine={false}
                width={32}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#BEE1FF' }} />
              <Line
                type="monotone"
                dataKey="enquiries"
                stroke="#1278E6"
                strokeWidth={2.4}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="qualified"
                stroke="#8FCBFF"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </ChartCard>
  );
}
