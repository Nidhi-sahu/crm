import { formatRangeLabel } from '../constants/dateRanges';
import { formatNumber } from '../../dashboard/utils/formatters';

const Item = ({ label, value }) => (
  <div className="space-y-0.5">
    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">{label}</p>
    <p className="text-sm font-semibold text-slate-800">{value}</p>
  </div>
);

export function ReportSummary({ appliedRange, data }) {
  const generatedAt = data?.generatedAt
    ? new Date(data.generatedAt).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  return (
    <div className="rounded-xl border border-brand-200 bg-brand-50 p-4">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-brand-700">
        Organization Sales Report Summary
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Item label="Selected Date Range" value={formatRangeLabel(appliedRange.from, appliedRange.to)} />
        <Item label="Total Enquiries" value={formatNumber(data?.performance?.totalEnquiries ?? 0)} />
        <Item label="Total Leads" value={formatNumber(data?.performance?.converted ?? 0)} />
        <Item label="Report Generated" value={generatedAt} />
      </div>
    </div>
  );
}
