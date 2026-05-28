import { useEffect, useState } from 'react';
import { useLeads } from '../hooks/useLeads';
import { useAuth } from '../../auth/hooks/useAuth';
import { PERMISSIONS } from '../../auth/constants/permissions';
import { LeadsKPIs } from '../components/LeadsKPIs';
import { LeadsFiltersBar } from '../components/LeadsFiltersBar';
import { LeadsTable } from '../components/LeadsTable';
import { LeadDetailsModal } from '../components/LeadDetailsModal';
import { LeadCommentsModal } from '../components/LeadCommentsModal';
import { Pagination } from '../../enquiries/components/Pagination';
import { Alert } from '../../../../shared/components/Alert';
import { Toast } from '../../../../shared/components/Toast';
import { LEAD_COLUMNS, COLUMN_STORAGE_KEY } from '../constants/leadColumns';

const defaultVisibleKeys = LEAD_COLUMNS.filter((c) => c.default || !c.hideable).map((c) => c.key);

export default function LeadsPage() {
  const { can } = useAuth();
  const {
    items,
    pagination,
    filters,
    error,
    isLoading,
    isError,
    isEmpty,
    stages,
    history,
    comments,
    saving,
    saveError,
    totals,
    setFilter,
    setPage,
    clearSaveError,
    loadHistory,
    loadComments,
    addComment,
    update,
    moveStage,
    undoStage,
    markWon,
    drop,
    reload,
  } = useLeads();

  const [visibleKeys, setVisibleKeys] = useState(() => {
    try {
      const saved = localStorage.getItem(COLUMN_STORAGE_KEY);
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr) && arr.length > 0) return arr;
      }
    } catch (_) {
      // ignore
    }
    return defaultVisibleKeys;
  });

  useEffect(() => {
    localStorage.setItem(COLUMN_STORAGE_KEY, JSON.stringify(visibleKeys));
  }, [visibleKeys]);

  const [detailsModal, setDetailsModal] = useState({ open: false, lead: null });
  const [commentsModal, setCommentsModal] = useState({ open: false, lead: null });
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

  const canEdit = can(PERMISSIONS.lead.update);
  const canMoveStage = can(PERMISSIONS.lead.moveStage);
  const canAssign = can(PERMISSIONS.lead.assign);

  const onView = (lead) => {
    clearSaveError();
    setDetailsModal({ open: true, lead });
  };

  const onComment = (lead) => {
    setCommentsModal({ open: true, lead });
    loadComments(lead._id);
  };

  const toggleColumn = (key) => {
    setVisibleKeys((cols) =>
      cols.includes(key) ? cols.filter((c) => c !== key) : [...cols, key],
    );
  };

  const resetColumns = () => setVisibleKeys(defaultVisibleKeys);

  const handleSaveProgress = async (leadId, payload) => {
    try {
      const updated = await update(leadId, payload);
      setDetailsModal((m) => ({ ...m, lead: { ...m.lead, ...updated } }));
      setToast({ open: true, tone: 'success', message: 'Lead updated' });
    } catch (_) {
      // saveError set in slice
    }
  };

  const handleCompleteStage = async (leadId, toStageId, won) => {
    try {
      let updated;
      if (won) {
        updated = await markWon(leadId);
      } else {
        updated = await moveStage(leadId, toStageId);
      }
      setDetailsModal((m) => ({ ...m, lead: { ...m.lead, ...updated } }));
      loadHistory(leadId);
      setToast({
        open: true,
        tone: 'success',
        message: won ? 'Lead marked as Won' : 'Stage completed',
      });
      reload();
    } catch (_) {
      // saveError set in slice
    }
  };

  const handleUndoStage = async (leadId) => {
    try {
      const updated = await undoStage(leadId);
      setDetailsModal((m) => ({ ...m, lead: { ...m.lead, ...updated } }));
      loadHistory(leadId);
      setToast({ open: true, tone: 'success', message: 'Stage reverted' });
      reload();
    } catch (_) {
      // saveError set in slice
    }
  };

  const handleDrop = async (leadId, reason) => {
    try {
      const updated = await drop(leadId, reason);
      setDetailsModal((m) => ({ ...m, lead: { ...m.lead, ...updated } }));
      setToast({ open: true, tone: 'success', message: 'Lead dropped' });
      reload();
    } catch (_) {
      // saveError set
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
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Leads Workflow</h1>
        <p className="mt-0.5 text-xs text-slate-500">
          Move leads through your sales pipeline — track planned vs actual progress.
        </p>
      </div>

      <LeadsKPIs totals={totals} loading={isLoading} />

      <LeadsFiltersBar
        filters={filters}
        stages={stages}
        onPatch={setFilter}
        visibleKeys={visibleKeys}
        onToggleColumn={toggleColumn}
        onResetColumns={resetColumns}
      />

      {isError && !isLoading && (
        <Alert tone="error" title="Couldn't load leads">
          <div className="flex items-center justify-between gap-3">
            <span>{error?.message || 'Please try again.'}</span>
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

      <LeadsTable
        leads={items}
        stages={stages}
        visibleKeys={visibleKeys}
        isLoading={isLoading}
        isEmpty={isEmpty}
        onView={onView}
        onComment={onComment}
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

      <LeadDetailsModal
        open={detailsModal.open}
        lead={detailsModal.lead}
        stages={stages}
        history={history}
        comments={comments}
        saving={saving}
        saveError={saveError}
        onClose={() => {
          setDetailsModal({ open: false, lead: null });
          clearSaveError();
        }}
        onSaveProgress={handleSaveProgress}
        onCompleteStage={handleCompleteStage}
        onUndoStage={handleUndoStage}
        onDropLead={handleDrop}
        onAddComment={addComment}
        onLoadHistory={loadHistory}
        onLoadComments={loadComments}
        canEdit={canEdit}
        canMoveStage={canMoveStage}
        canAssign={canAssign}
        onVisitChanged={reload}
      />

      <LeadCommentsModal
        open={commentsModal.open}
        lead={commentsModal.lead}
        comments={comments.items}
        loading={comments.status === 'loading'}
        saving={saving}
        onClose={() => setCommentsModal({ open: false, lead: null })}
        onAddComment={async (input) => {
          await addComment(input);
          setToast({ open: true, tone: 'success', message: 'Comment added' });
        }}
      />
    </div>
  );
}
