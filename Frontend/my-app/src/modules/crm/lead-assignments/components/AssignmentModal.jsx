import { useEffect, useState } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { SelectInput } from '../../../../shared/components/SelectInput';
import { Alert } from '../../../../shared/components/Alert';
import { Skeleton } from '../../dashboard/components/Skeleton';
import { leadAssignmentService } from '../services/leadAssignmentService';

const SectionHeader = ({ children }) => (
  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">
    {children}
  </h3>
);

const InfoRow = ({ label, value }) => (
  <div className="space-y-0.5">
    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">{label}</p>
    <p className="text-sm text-slate-800 break-words">
      {value || <span className="text-slate-300">—</span>}
    </p>
  </div>
);

const shortCode = (id, prefix) => {
  if (!id) return '—';
  return `${prefix}-${String(id).slice(-6).toUpperCase()}`;
};

const formatBudget = (min, max) => {
  const fmt = new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 });
  const hasMin = Number(min) > 0;
  const hasMax = Number(max) > 0;
  if (!hasMin && !hasMax) return null;
  if (hasMin && hasMax) return `₹${fmt.format(min)} – ₹${fmt.format(max)}`;
  if (hasMax) return `Up to ₹${fmt.format(max)}`;
  return `From ₹${fmt.format(min)}`;
};

export function AssignmentModal({
  open,
  lead,
  salesPersons,
  saving,
  saveError,
  onSubmit,
  onClose,
  onClearError,
}) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [enquiry, setEnquiry] = useState(null);
  const [qualification, setQualification] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedUserId('');
      setEnquiry(null);
      setQualification(null);
      return;
    }
    onClearError?.();
    const enquiryId = lead?.enquiryId?._id || lead?.enquiryId;
    if (!enquiryId) return;

    setDetailsLoading(true);
    Promise.all([
      leadAssignmentService.getEnquiry(enquiryId),
      leadAssignmentService.getQualification(enquiryId),
    ])
      .then(([e, q]) => {
        setEnquiry(e || lead?.enquiryId || null);
        setQualification(q);
      })
      .finally(() => setDetailsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lead?._id]);

  if (!lead) return null;

  const e = enquiry || lead.enquiryId || {};

  const handleSubmit = async () => {
    if (!selectedUserId) return;
    await onSubmit(lead._id, selectedUserId);
  };

  const answers = qualification?.answers || [];
  const budgetAnswer = answers.find(
    (a) => a.questionId === 'budgetRange' || a.questionText === 'What is the client budget?',
  )?.answer;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Assign Lead"
      subtitle="Distribute this qualified lead to a sales person"
      width="max-w-2xl"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!selectedUserId || saving}
            loading={saving}
          >
            Assign Lead
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {saveError?.message && (
          <Alert tone="error" title="Couldn't assign">
            {saveError.message}
          </Alert>
        )}

        {/* Section 1 - Lead Details */}
        <section className="space-y-2">
          <SectionHeader>Lead Details</SectionHeader>
          <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
            <InfoRow label="Enquiry ID" value={shortCode(e._id || lead.enquiryId, 'ENQ')} />
            <InfoRow label="Client Name" value={e.clientName} />
            <InfoRow label="Company" value={e.companyName} />
            <InfoRow label="Phone" value={e.clientPhone} />
            <InfoRow label="Email" value={e.clientEmail} />
            <InfoRow
              label="Budget"
              value={budgetAnswer || formatBudget(e.budgetMin, e.budgetMax)}
            />
            <InfoRow label="Lead Temperature" value={lead.temperature || e.temperature} />
            <div className="sm:col-span-2">
              <InfoRow label="Requirement" value={e.requirement || lead.requirement} />
            </div>
          </div>
        </section>

        <div className="border-t border-slate-100" />

        {/* Section 2 - Qualification Details */}
        <section className="space-y-2">
          <SectionHeader>Qualification Details</SectionHeader>
          {detailsLoading ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" rounded="rounded-lg" />
              ))}
            </div>
          ) : !qualification ? (
            <p className="text-xs text-slate-500">
              No qualification record found for this enquiry.
            </p>
          ) : answers.length === 0 ? (
            <p className="text-xs text-slate-500">No qualification answers recorded.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {answers.map((a, i) => (
                  <div key={i} className="rounded-lg border border-slate-200 bg-white p-2.5">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      {a.questionText || a.question}
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-slate-900 break-words">
                      {String(a.answer ?? '')}
                    </p>
                  </div>
                ))}
              </div>
              {qualification.remarks && (
                <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    Remarks
                  </p>
                  <p className="mt-0.5 text-sm text-slate-700 break-words">
                    {qualification.remarks}
                  </p>
                </div>
              )}
            </>
          )}
        </section>

        <div className="border-t border-slate-100" />

        {/* Section 3 - Assign Sales Person */}
        <section className="space-y-2">
          <SectionHeader>Assign Sales Person *</SectionHeader>
          <SelectInput
            placeholder="Select sales person"
            value={selectedUserId}
            onChange={(ev) => setSelectedUserId(ev.target.value)}
            options={salesPersons.map((u) => ({
              value: u._id,
              label: u.name ? `${u.name}${u.email ? ` · ${u.email}` : ''}` : u.email || u._id,
            }))}
          />
        </section>
      </div>
    </Modal>
  );
}
