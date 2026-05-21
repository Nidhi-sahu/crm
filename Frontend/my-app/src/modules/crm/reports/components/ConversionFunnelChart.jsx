import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { Skeleton } from '../../dashboard/components/Skeleton';
import { colorAt } from '../../dashboard/utils/colorPalette';

const renderTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-soft">
      <p className="font-medium text-slate-700">{row.label}</p>
      <p className="mt-0.5 text-slate-600">
        Count: <span className="font-semibold text-slate-900">{row.count}</span>
      </p>
      <p className="text-slate-600">
        Of top: <span className="font-medium text-slate-800">{row.pctOfTop}%</span>
      </p>
    </div>
  );
};

export function ConversionFunnelChart({ funnel, loading }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-soft">
      <div className="border-b border-slate-100 px-5 py-4">
        <p className="text-sm font-semibold text-slate-900">Conversion Funnel</p>
        <p className="mt-0.5 text-xs text-slate-500">
          Complete sales pipeline — count &amp; conversion progression
        </p>
      </div>
      <div className="p-5">
        {loading ? (
          <Skeleton className="h-80 w-full" rounded="rounded-lg" />
        ) : !funnel || funnel.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">No funnel data.</p>
        ) : (
          <>
            <div style={{ height: Math.max(320, funnel.length * 38) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={funnel}
                  layout="vertical"
                  margin={{ top: 4, right: 48, left: 8, bottom: 4 }}
                  barCategoryGap="22%"
                >
                  <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={210}
                    tick={{ fill: '#475569', fontSize: 11 }}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tickLine={false}
                  />
                  <Tooltip content={renderTooltip} cursor={{ fill: '#F1F5F9' }} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} label={{ position: 'right', fill: '#64748B', fontSize: 11 }}>
                    {funnel.map((entry, i) => (
                      <Cell key={entry.label} fill={colorAt(i)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Stage progression list */}
            <div className="mt-4 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {funnel.map((s, i) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-xs"
                >
                  <span className="flex items-center gap-2 text-slate-700">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: colorAt(i) }}
                    />
                    <span className="truncate">{s.label}</span>
                  </span>
                  <span className="shrink-0 text-slate-500">
                    <span className="font-semibold text-slate-900">{s.count}</span> · {s.pctOfTop}%
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
