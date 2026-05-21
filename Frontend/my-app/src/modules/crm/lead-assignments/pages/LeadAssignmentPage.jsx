import { useState } from 'react';
import { useLeadAssignment } from '../hooks/useLeadAssignment';
import { useAuth } from '../../auth/hooks/useAuth';
import { PERMISSIONS } from '../../auth/constants/permissions';
import { AssignmentKPIs } from '../components/AssignmentKPIs';
import { DistributionTable } from '../components/DistributionTable';
import { LeadAssignmentTable } from '../components/LeadAssignmentTable';
import { AssignmentModal } from '../components/AssignmentModal';
import { Pagination } from '../../enquiries/components/Pagination';
import { Alert } from '../../../../shared/components/Alert';
import { Toast } from '../../../../shared/components/Toast';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
    <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

export default function LeadAssignmentPage() {
  const { can } = useAuth();
  const {
    leads,
    isLoading,
    isError,
    isEmpty,
    leadsError,
    pagination,
    filters,
    salesPersons,
    workload,
    saving,
    saveError,
    totals,
    setSearch,
    setPage,
    clearSaveError,
    submitAssign,
    reload,
  } = useLeadAssignment();

  const [assignModal, setAssignModal] = useState({ open: false, lead: null });
  const [toast, setToast] = useState({ open: false, tone: 'success', message: '' });

  if (!can(PERMISSIONS.lead.read)) {
    return (
      <div className="mx-auto max-w-md">
        <Alert tone="error" title="Access restricted">
          You don&apos;t have permission to view leads.
        </Alert>
      </div>
    );
  }

  const canAssign = can(PERMISSIONS.lead.assign);

  const openAssign = (lead) => {
    if (!canAssign) return;
    setAssignModal({ open: true, lead });
  };

  const handleSubmit = async (leadId, assignedTo, reason) => {
    try {
      await submitAssign(leadId, assignedTo, reason);
      setToast({ open: true, tone: 'success', message: 'Lead assigned' });
      setAssignModal({ open: false, lead: null });
      reload();
    } catch (_) {
      // saveError remains in state
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <Toast
        open={toast.open}
        tone={toast.tone}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />

      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Lead Assignment</h1>
        <p className="mt-0.5 text-xs text-slate-500">
          Distribute qualified leads to your sales team — system auto-assigns unassigned leads after 24 hours.
        </p>
      </div>

      <AssignmentKPIs totals={totals} loading={isLoading} />

      <DistributionTable
        workload={workload}
        loading={isLoading}
        globalPending={totals.pending}
      />

      <div className="flex items-center gap-3">
        <div className="relative flex-1 sm:max-w-md">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search client name, phone, email…"
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>
      </div>

      {isError && !isLoading && (
        <Alert tone="error" title="Couldn't load leads">
          <div className="flex items-center justify-between gap-3">
            <span>{leadsError?.message || 'Please try again.'}</span>
            <button
              type="button"
              onClick={reload}
              className="rounded-md border border-rose-300 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100"
            >
              Retry
            </button>
          </div>
        </Alert>
      )}

      <LeadAssignmentTable
        leads={leads}
        isLoading={isLoading}
        isEmpty={isEmpty}
        onAssign={canAssign ? openAssign : undefined}
      />

      {!isLoading && pagination.total > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft">
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onChange={setPage}
          />
        </div>
      )}

      <AssignmentModal
        open={assignModal.open}
        lead={assignModal.lead}
        salesPersons={salesPersons}
        saving={saving}
        saveError={saveError}
        onSubmit={handleSubmit}
        onClose={() => {
          setAssignModal({ open: false, lead: null });
          clearSaveError();
        }}
        onClearError={clearSaveError}
      />
    </div>
  );
}
