import { useDashboard } from '../hooks/useDashboard';
import { useAuth } from '../../auth/hooks/useAuth';
import { KPICard } from '../components/KPICard';
import { ConversionFunnelChart } from '../components/ConversionFunnelChart';
import { LeadSourceChart } from '../components/LeadSourceChart';
import { TeamPerformanceTable } from '../components/TeamPerformanceTable';
import { ErrorState } from '../components/ErrorState';
import { formatNumber, formatPercent } from '../utils/formatters';
import { PERMISSIONS } from '../../auth/constants/permissions';

const EnquiryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M5 4h14v12H8l-3 3V4Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
  </svg>
);

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
    <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M5 12.5 10 17l9-10"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TrendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="m3 17 6-6 4 4 8-9"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M14 6h7v7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export default function DashboardPage() {
  const { can } = useAuth();
  const {
    overview,
    sourceBreakdown,
    salespersonPerformance,
    conversionFunnel,
    reloadOverview,
    reloadSourceBreakdown,
    reloadSalespersonPerformance,
    reloadConversionFunnel,
  } = useDashboard();

  if (!can(PERMISSIONS.dashboard.view)) {
    return (
      <div className="mx-auto max-w-md">
        <ErrorState message="You don't have permission to view the dashboard." />
      </div>
    );
  }

  const kpiLoading = overview.status === 'loading' || overview.status === 'idle';
  const kpis = overview.data?.kpis || {
    totalEnquiries: 0,
    pendingQualification: 0,
    qualifiedLeads: 0,
    qualificationConversionRate: 0,
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {overview.status === 'failed' && !overview.data && (
        <div className="rounded-xl border border-rose-200 bg-rose-50">
          <ErrorState
            message={overview.error?.message || 'Failed to load overview KPIs.'}
            onRetry={reloadOverview}
          />
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="Total Enquiries"
          value={formatNumber(kpis.totalEnquiries)}
          loading={kpiLoading}
          icon={<EnquiryIcon />}
          accent="bg-brand-100 text-brand-600"
        />
        <KPICard
          label="Pending Qualification"
          value={formatNumber(kpis.pendingQualification)}
          loading={kpiLoading}
          icon={<ClockIcon />}
          accent="bg-amber-50 text-amber-600"
        />
        <KPICard
          label="Qualified Leads"
          value={formatNumber(kpis.qualifiedLeads)}
          loading={kpiLoading}
          icon={<CheckIcon />}
          accent="bg-emerald-50 text-emerald-600"
        />
        <KPICard
          label="Qualification Conversion"
          value={formatPercent(kpis.qualificationConversionRate)}
          hint="Leads ÷ Enquiries"
          loading={kpiLoading}
          icon={<TrendIcon />}
          accent="bg-brand-100 text-brand-600"
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ConversionFunnelChart section={conversionFunnel} onRetry={reloadConversionFunnel} />
        <LeadSourceChart section={sourceBreakdown} onRetry={reloadSourceBreakdown} />
      </section>

      <section>
        <TeamPerformanceTable
          section={salespersonPerformance}
          onRetry={reloadSalespersonPerformance}
        />
      </section>
    </div>
  );
}
