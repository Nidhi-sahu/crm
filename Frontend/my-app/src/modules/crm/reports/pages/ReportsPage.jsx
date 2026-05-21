import { useReports } from '../hooks/useReports';
import { useAuth } from '../../auth/hooks/useAuth';
import { PERMISSIONS } from '../../auth/constants/permissions';
import { ReportFiltersBar } from '../components/ReportFiltersBar';
import { ReportSummary } from '../components/ReportSummary';
import { PerformanceCards } from '../components/PerformanceCards';
import { ConversionFunnelChart } from '../components/ConversionFunnelChart';
import { ValueAnalysisCards } from '../components/ValueAnalysisCards';
import { TimeAnalysisSection } from '../components/TimeAnalysisSection';
import { TeamComparisonTable } from '../components/TeamComparisonTable';
import { Alert } from '../../../../shared/components/Alert';
import { formatRangeLabel } from '../constants/dateRanges';
import { exportReportCSV } from '../utils/reportExport';

export default function ReportsPage() {
  const { can } = useAuth();
  const {
    filters,
    appliedRange,
    data,
    error,
    isLoading,
    isError,
    setFilter,
    generate,
  } = useReports();

  if (!can(PERMISSIONS.report.view)) {
    return (
      <div className="mx-auto max-w-md">
        <Alert tone="error" title="Access restricted">
          You don&apos;t have permission to view reports.
        </Alert>
      </div>
    );
  }

  const handleExport = () => {
    if (!data) return;
    exportReportCSV({
      rangeLabel: formatRangeLabel(appliedRange.from, appliedRange.to),
      generatedAt: data.generatedAt
        ? new Date(data.generatedAt).toLocaleString('en-IN')
        : '',
      performance: data.performance,
      funnel: data.funnel,
      time: data.time,
      value: data.value,
    });
  };

  const isTeam = filters.reportType === 'teamComparison';

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
          Reports &amp; Analytics
        </h1>
        <p className="mt-0.5 text-xs text-slate-500">
          Sales performance, conversion funnel and pipeline timing.
        </p>
      </div>

      <ReportFiltersBar
        filters={filters}
        onPatch={setFilter}
        onGenerate={generate}
        onExport={handleExport}
        loading={isLoading}
        canExport={!!data}
      />

      {isError && (
        <Alert tone="error" title="Couldn't generate report">
          <div className="flex items-center justify-between gap-3">
            <span>{error?.message || 'Please try again.'}</span>
            <button
              type="button"
              onClick={generate}
              className="rounded-md border border-rose-300 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100"
            >
              Retry
            </button>
          </div>
        </Alert>
      )}

      <ReportSummary appliedRange={appliedRange} data={data} />

      <PerformanceCards performance={data?.performance} loading={isLoading} />

      {isTeam ? (
        <TeamComparisonTable scorecard={data?.scorecard} loading={isLoading} />
      ) : (
        <>
          <ConversionFunnelChart funnel={data?.funnel} loading={isLoading} />
          <ValueAnalysisCards value={data?.value} loading={isLoading} />
          <TimeAnalysisSection time={data?.time} loading={isLoading} />
        </>
      )}
    </div>
  );
}
