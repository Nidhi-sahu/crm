import { useEffect, useMemo, useState } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { Input } from '../../../../shared/components/Input';
import { Textarea } from '../../../../shared/components/Textarea';
import { Alert } from '../../../../shared/components/Alert';
import { Skeleton } from '../../dashboard/components/Skeleton';
import { LeadStatusBadge } from './LeadStatusBadge';
import { LeadTimeline } from './LeadTimeline';
import { DropLeadDialog } from './DropLeadDialog';
import { StageProgress } from './StageProgress';
import { StageMoveDialog } from './StageMoveDialog';
import { formatDate, initialsOf, shortCode } from '../utils/leadFormatters';

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

const isoDateInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

const findNextStage = (lead, stages) => {
  const stage = lead?.currentStageId;
  if (!stage) return null;
  const allowed = stage.allowedNextStages || [];
  if (allowed.length > 0) {
    const next = stages.find((s) => String(s._id) === String(allowed[0]));
    if (next) return next;
  }
  const ordered = stages.filter((s) => Number.isFinite(s.order));
  const cur = ordered.find((s) => String(s._id) === String(stage._id || stage));
  if (!cur) return null;
  return ordered.find((s) => s.order === cur.order + 1) || null;
};

export function LeadDetailsModal({
  open,
  lead,
  stages,
  history,
  comments,
  saving,
  saveError,
  onClose,
  onSaveProgress,
  onCompleteStage,
  onUndoStage,
  onDropLead,
  onAddComment,
  onLoadHistory,
  onLoadComments,
  canEdit,
  canMoveStage,
}) {
  const [requirement, setRequirement] = useState('');
  const [plannedValue, setPlannedValue] = useState('');
  const [actualValue, setActualValue] = useState('');
  const [plannedDate, setPlannedDate] = useState('');
  const [comment, setComment] = useState('');
  const [dropOpen, setDropOpen] = useState(false);
  const [stageDialog, setStageDialog] = useState({ open: false, mode: 'move' });

  useEffect(() => {
    if (!open || !lead) return;
    setRequirement(lead.enquiryId?.requirement || lead.requirement || '');
    setPlannedValue(lead.expectedRevenue ? String(lead.expectedRevenue) : '');
    setActualValue(
      lead.actualValue !== null && lead.actualValue !== undefined
        ? String(lead.actualValue)
        : '',
    );
    setPlannedDate(isoDateInput(lead.plannedStageAt));
    setComment('');
    if (lead._id) {
      onLoadHistory?.(lead._id);
      onLoadComments?.(lead._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lead?._id]);

  const nextStage = useMemo(() => findNextStage(lead || {}, stages), [lead, stages]);

  if (!lead) return null;

  const isFinal = lead.currentStageId?.isFinal;
  const isClosed = lead.status !== 'active';
  const hasMovedOnce = !!lead.actualStageAt;

  const handleSaveProgress = async () => {
    const payload = {};
    const currentReq = (lead.enquiryId?.requirement || lead.requirement || '').trim();
    if (requirement.trim() !== currentReq) {
      payload.requirement = requirement.trim();
    }
    if (plannedValue !== '' && Number(plannedValue) !== Number(lead.expectedRevenue || 0)) {
      payload.expectedRevenue = Number(plannedValue);
    }
    if (plannedDate && plannedDate !== isoDateInput(lead.plannedStageAt)) {
      payload.plannedStageAt = new Date(plannedDate).toISOString();
    }
    const currentActual =
      lead.actualValue !== null && lead.actualValue !== undefined ? Number(lead.actualValue) : null;
    if (actualValue !== '' && Number(actualValue) !== currentActual) {
      payload.actualValue = Number(actualValue);
    }
    if (Object.keys(payload).length === 0 && !comment.trim()) {
      return;
    }
    if (Object.keys(payload).length > 0) {
      await onSaveProgress(lead._id, payload);
    }
    if (comment.trim()) {
      await onAddComment({
        leadId: lead._id,
        comment: comment.trim(),
      });
      setComment('');
    }
  };

  const handleConfirmMove = async (targetStageId) => {
    if (!targetStageId) return;
    await onCompleteStage(lead._id, targetStageId, false);
    setStageDialog({ open: false, mode: 'move' });
  };

  const handleConfirmWon = async () => {
    await onCompleteStage(lead._id, null, true);
    setStageDialog({ open: false, mode: 'move' });
  };

  const handleUndoStage = async () => {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Undo the last stage move?')) return;
    await onUndoStage(lead._id);
  };

  const handleDrop = async (reason) => {
    await onDropLead(lead._id, reason);
    setDropOpen(false);
  };

  const enquiry = lead.enquiryId || {};

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Lead Details"
        subtitle={enquiry.clientName ? `${enquiry.clientName} · ${shortCode(enquiry._id, 'ENQ')}` : ''}
        width="max-w-3xl"
        footer={
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              {canEdit && !isClosed && (
                <button
                  type="button"
                  onClick={() => setDropOpen(true)}
                  className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
                >
                  Drop Lead
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={onClose} disabled={saving}>Close</Button>
              {canEdit && !isClosed && (
                <Button
                  variant="secondary"
                  onClick={handleSaveProgress}
                  loading={saving}
                  disabled={saving}
                  className="!gap-1.5 !rounded-md !px-3 !py-1.5 !text-xs"
                >
                  Save Progress
                </Button>
              )}
              {canMoveStage && !isClosed && isFinal && (
                <Button
                  variant="primary"
                  onClick={() => setStageDialog({ open: true, mode: 'won' })}
                  disabled={saving}
                  className="!gap-1.5 !rounded-md !px-3 !py-1.5 !text-xs"
                >
                  Mark Won
                </Button>
              )}
              {canMoveStage && !isClosed && (
                <Button
                  variant="primary"
                  onClick={() => setStageDialog({ open: true, mode: 'move' })}
                  disabled={saving}
                  className="!gap-1.5 !rounded-md !px-3 !py-1.5 !text-xs"
                >
                  Change Stage
                </Button>
              )}
            </div>
          </div>
        }
      >
        <div className="space-y-5">
          {saveError?.message && (
            <Alert tone="error" title="Action failed">{saveError.message}</Alert>
          )}

          {/* Section 1 — Client Information */}
          <section className="space-y-2">
            <SectionHeader>Client Information</SectionHeader>
            <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
              <InfoRow label="Client Name" value={enquiry.clientName} />
              <InfoRow label="Company" value={enquiry.companyName} />
              <InfoRow label="Phone" value={enquiry.clientPhone} />
              <InfoRow label="Email" value={enquiry.clientEmail} />
            </div>
          </section>

          <div className="border-t border-slate-100" />

          {/* Section — Lead Information */}
          <section className="space-y-2">
            <SectionHeader>Lead Information</SectionHeader>
            <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
              <div className="space-y-0.5">
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  Lead Status
                </p>
                <div className="pt-0.5"><LeadStatusBadge status={lead.status} /></div>
              </div>
              <InfoRow
                label="Assigned To"
                value={
                  lead.assignedTo ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-[10px] font-semibold text-brand-700">
                        {initialsOf(lead.assignedTo.name)}
                      </span>
                      {lead.assignedTo.name}
                    </span>
                  ) : null
                }
              />
              <div className="sm:col-span-2">
                <Textarea
                  label="Requirement"
                  rows={2}
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value)}
                  disabled={!canEdit || isClosed}
                />
              </div>
            </div>
          </section>

          <div className="border-t border-slate-100" />

          {/* Section 3 — Planning & Values */}
          <section className="space-y-2">
            <SectionHeader>Planning & Values</SectionHeader>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="Planned Date"
                type="date"
                value={plannedDate}
                onChange={(e) => setPlannedDate(e.target.value)}
                disabled={!canEdit || isClosed}
              />
              <Input
                label="Actual Date"
                type="date"
                value={isoDateInput(lead.actualStageAt)}
                disabled
              />
              <Input
                label="Planned Value (₹)"
                type="number"
                min="0"
                value={plannedValue}
                onChange={(e) => setPlannedValue(e.target.value)}
                disabled={!canEdit || isClosed}
              />
              <Input
                label="Actual Value (₹)"
                type="number"
                min="0"
                value={actualValue}
                onChange={(e) => setActualValue(e.target.value)}
                disabled={!canEdit || isClosed}
              />
            </div>
          </section>

          <div className="border-t border-slate-100" />

          {/* Section 4 — Comment */}
          {!isClosed && (
            <section className="space-y-2">
              <SectionHeader>Comment</SectionHeader>
              <Textarea
                rows={2}
                placeholder="Add a quick note or followup detail…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <p className="text-[11px] text-slate-500">
                Comment will be added when you click <em>Save Progress</em>.
              </p>
            </section>
          )}

          <div className="border-t border-slate-100" />

          {/* Section — Stage Progress */}
          <section className="space-y-2">
            <SectionHeader>Stage Progress</SectionHeader>
            <StageProgress
              stages={stages}
              currentStage={lead.currentStageId}
              nextStage={nextStage}
              canUndo={canMoveStage && hasMovedOnce && !isClosed}
              onUndo={handleUndoStage}
              undoing={saving}
            />
          </section>

          <div className="border-t border-slate-100" />

          {/* Timeline */}
          <section className="space-y-2">
            <SectionHeader>Timeline</SectionHeader>
            {(history?.status === 'loading' || comments?.status === 'loading') ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" rounded="rounded-lg" />
                <Skeleton className="h-10 w-full" rounded="rounded-lg" />
              </div>
            ) : (
              <LeadTimeline
                lead={lead}
                history={history?.items || []}
                comments={comments?.items || []}
              />
            )}
          </section>

          <p className="text-[11px] text-slate-400 text-center">
            Last activity: {formatDate(lead.lastActivityAt || lead.updatedAt)}
          </p>
        </div>
      </Modal>

      <DropLeadDialog
        open={dropOpen}
        lead={lead}
        saving={saving}
        onClose={() => setDropOpen(false)}
        onConfirm={handleDrop}
      />

      <StageMoveDialog
        open={stageDialog.open}
        mode={stageDialog.mode}
        lead={lead}
        stages={stages}
        saving={saving}
        onClose={() => setStageDialog({ open: false, mode: 'move' })}
        onConfirmMove={handleConfirmMove}
        onConfirmWon={handleConfirmWon}
      />
    </>
  );
}
