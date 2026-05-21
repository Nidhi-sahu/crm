import { useState } from 'react';
import { useEnquiryList } from '../hooks/useEnquiryList';
import { useAuth } from '../../auth/hooks/useAuth';
import { EnquiryKPIs } from '../components/EnquiryKPIs';
import { EnquiryFiltersBar } from '../components/EnquiryFiltersBar';
import { EnquiryTable } from '../components/EnquiryTable';
import { Pagination } from '../components/Pagination';
import { EnquiryFormModal } from '../components/EnquiryFormModal';
import { EnquiryDetailsModal } from '../components/EnquiryDetailsModal';
import { QualificationModal } from '../../qualifications/components/QualificationModal';
import { Alert } from '../../../../shared/components/Alert';
import { Toast } from '../../../../shared/components/Toast';
import { PERMISSIONS } from '../../auth/constants/permissions';

export default function EnquiryListPage() {
  const { can } = useAuth();
  const {
    items,
    pagination,
    filters,
    sort,
    error,
    saving,
    saveError,
    kpis,
    kpisStatus,
    isLoading,
    isError,
    isEmpty,
    setFilter,
    resetFilters,
    setPage,
    setSort,
    clearSaveError,
    create,
    update,
    reload,
  } = useEnquiryList();

  const [formModal, setFormModal] = useState({ open: false, mode: 'create', enquiry: null });
  const [detailsModal, setDetailsModal] = useState({ open: false, enquiry: null });
  const [qualifyModal, setQualifyModal] = useState({ open: false, enquiry: null });
  const [toast, setToast] = useState({ open: false, tone: 'success', message: '' });

  if (!can(PERMISSIONS.enquiry.read)) {
    return (
      <div className="mx-auto max-w-md">
        <Alert tone="error" title="Access restricted">
          You don&apos;t have permission to view enquiries.
        </Alert>
      </div>
    );
  }

  const canCreate = can(PERMISSIONS.enquiry.create);

  const filtersActive = !!filters.search || !!filters.uiStatus;

  const openCreate = () => {
    if (!canCreate) return;
    clearSaveError();
    setFormModal({ open: true, mode: 'create', enquiry: null });
  };

  const closeForm = () => {
    setFormModal((d) => ({ ...d, open: false }));
    clearSaveError();
  };

  const handleSubmit = async (payload) => {
    try {
      if (formModal.mode === 'edit' && formModal.enquiry?._id) {
        await update(formModal.enquiry._id, payload);
        setToast({ open: true, tone: 'success', message: 'Enquiry updated' });
      } else {
        await create(payload);
        setToast({ open: true, tone: 'success', message: 'Enquiry created' });
        reload();
      }
      setFormModal((d) => ({ ...d, open: false }));
    } catch (_) {
      // saveError stays in redux state
    }
  };

  const onView = (enquiry) => setDetailsModal({ open: true, enquiry });
  const onQualify = (enquiry) => setQualifyModal({ open: true, enquiry });

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <Toast
        open={toast.open}
        tone={toast.tone}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />

      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Enquiries</h1>
        <p className="mt-0.5 text-xs text-slate-500">
          Qualification queue starts here — capture, filter and act on incoming enquiries.
        </p>
      </div>

      <EnquiryKPIs kpis={kpis} loading={kpisStatus === 'loading' || kpisStatus === 'idle'} />

      <EnquiryFiltersBar
        filters={filters}
        onPatch={setFilter}
        onAdd={canCreate ? openCreate : undefined}
      />

      {isError && !isLoading && (
        <Alert tone="error" title="Couldn't load enquiries">
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

      <EnquiryTable
        items={items}
        isLoading={isLoading}
        isEmpty={isEmpty}
        filtersActive={filtersActive}
        sort={sort}
        onSort={setSort}
        onView={onView}
        onQualify={onQualify}
        onAdd={canCreate ? openCreate : undefined}
        onResetFilters={resetFilters}
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

      <EnquiryFormModal
        open={formModal.open}
        mode={formModal.mode}
        enquiry={formModal.enquiry}
        saving={saving}
        serverError={saveError}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />

      <EnquiryDetailsModal
        open={detailsModal.open}
        enquiry={detailsModal.enquiry}
        onClose={() => setDetailsModal({ open: false, enquiry: null })}
      />

      <QualificationModal
        open={qualifyModal.open}
        enquiry={qualifyModal.enquiry}
        onClose={() => setQualifyModal({ open: false, enquiry: null })}
        onSubmitted={() => {
          setToast({ open: true, tone: 'success', message: 'Qualification submitted' });
          reload();
        }}
      />
    </div>
  );
}
