import { useEffect, useMemo, useState } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { Input } from '../../../../shared/components/Input';
import { SelectInput } from '../../../../shared/components/SelectInput';
import { Textarea } from '../../../../shared/components/Textarea';
import { Alert } from '../../../../shared/components/Alert';
import { Skeleton } from '../../dashboard/components/Skeleton';
import { LeadStatusBadge } from './LeadStatusBadge';
import { LeadStageBadge } from './LeadStageBadge';
import { TemperatureChip } from '../../enquiries/components/TemperatureChip';
import { TEMPERATURE_OPTIONS } from '../../enquiries/constants/enquiryTemperatures';
import { LeadTimeline } from './LeadTimeline';
import { DropLeadDialog } from './DropLeadDialog';
import { StageProgress } from './StageProgress';
import { StageMoveDialog } from './StageMoveDialog';
import { VisitReportModal } from './VisitReportModal';
import { MoveBackFromVisitModal } from './MoveBackFromVisitModal';
import { CallLogModal } from './CallLogModal';
import { WhatsappModal } from './WhatsappModal';
import { PreviousLeadHistoryPanel } from './PreviousLeadHistoryPanel';
import { AssignmentHistoryPanel } from './AssignmentHistoryPanel';
import { formatDate, initialsOf, shortCode } from '../utils/leadFormatters';
import { useAuth } from '../../auth/hooks/useAuth';
import { leadsService } from '../services/leadsService';
import { AutoAssignedBadge } from '../../lead-assignments/components/AutoAssignedBadge';
import { leadAssignmentService } from '../../lead-assignments/services/leadAssignmentService';

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

const CALL_OUTCOME_LABEL = {
  connected: 'Connected',
  not_picked: 'Not Picked',
  busy: 'Busy',
  switched_off: 'Switched Off',
  wrong_number: 'Wrong Number',
  call_back_later: 'Call Back Later',
};

const CALL_OUTCOME_TONE = {
  connected: 'bg-emerald-100 text-emerald-700',
  not_picked: 'bg-amber-100 text-amber-700',
  busy: 'bg-amber-100 text-amber-700',
  switched_off: 'bg-slate-100 text-slate-600',
  wrong_number: 'bg-rose-100 text-rose-700',
  call_back_later: 'bg-brand-100 text-brand-700',
};

const WA_STATUS_TONE = {
  queued: 'bg-slate-100 text-slate-600',
  sent: 'bg-brand-100 text-brand-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  read: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-rose-100 text-rose-700',
};

const formatDuration = (seconds) => {
  const s = Number(seconds) || 0;
  if (s <= 0) return '—';
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (m === 0) return `${rem}s`;
  return rem ? `${m}m ${rem}s` : `${m}m`;
};

const formatDateTime = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
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
  onCompleteVisit,
  onUndoStage,
  onDropLead,
  onAddComment,
  onLoadHistory,
  onLoadComments,
  canEdit,
  canMoveStage,
  canAssign = false,
  onVisitChanged,
}) {
  const [requirement, setRequirement] = useState('');
  const [plannedValue, setPlannedValue] = useState('');
  const [actualValue, setActualValue] = useState('');
  const [plannedDate, setPlannedDate] = useState('');
  const [comment, setComment] = useState('');
  const [dropOpen, setDropOpen] = useState(false);
  const [stageDialog, setStageDialog] = useState({ open: false, mode: 'move' });
  const [progressError, setProgressError] = useState('');
  const [visitReportOpen, setVisitReportOpen] = useState(false);
  const [visitReports, setVisitReports] = useState([]);
  const [latestAssignment, setLatestAssignment] = useState(null);
  const [moveBackOpen, setMoveBackOpen] = useState(false);
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [calls, setCalls] = useState([]);
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [whatsapps, setWhatsapps] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const { user: currentUser } = useAuth();
  const isAdmin =
    (currentUser?.roleId?.name || currentUser?.role?.name) === 'Administrator';

  const loadVisitReports = (id) => {
    leadsService
      .listVisitReports(id)
      .then(setVisitReports)
      .catch(() => setVisitReports([]));
  };

  const loadCalls = (id) => {
    leadsService
      .listCalls(id)
      .then(setCalls)
      .catch(() => setCalls([]));
  };

  const loadWhatsapps = (id) => {
    leadsService
      .listWhatsapp(id)
      .then(setWhatsapps)
      .catch(() => setWhatsapps([]));
  };

  const [localVisitAssignee, setLocalVisitAssignee] = useState(null);
  const [visitMembers, setVisitMembers] = useState([]);
  const [visitEditing, setVisitEditing] = useState(false);
  const [visitSelected, setVisitSelected] = useState('');
  const [visitSubmitting, setVisitSubmitting] = useState(false);

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
    setActiveTab('overview');
    setLocalVisitAssignee(lead.visitAssignedTo || null);
    setVisitEditing(false);
    if (lead._id) {
      onLoadHistory?.(lead._id);
      onLoadComments?.(lead._id);
      loadVisitReports(lead._id);
      loadCalls(lead._id);
      loadWhatsapps(lead._id);
      setLatestAssignment(null);
      leadAssignmentService
        .fetchAssignmentHistory({ leadId: lead._id, limit: 1 })
        .then((items) => setLatestAssignment((items && items[0]) || null))
        .catch(() => setLatestAssignment(null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lead?._id]);

  const startEditVisit = async () => {
    setVisitEditing(true);
    setVisitSelected(localVisitAssignee?._id || '');
    if (visitMembers.length === 0) {
      try {
        const members = await leadsService.listVisitTeamMembers();
        setVisitMembers(members);
      } catch (_) {
        setVisitMembers([]);
      }
    }
  };

  const submitVisitAssign = async () => {
    if (!lead?._id || !visitSelected) return;
    setVisitSubmitting(true);
    try {
      const updated = await leadsService.assignVisit(lead._id, visitSelected);
      setLocalVisitAssignee(updated?.visitAssignedTo || null);
      setVisitEditing(false);
      if (onVisitChanged) onVisitChanged();
    } catch (_) {
      // surface via existing toast pattern from parent — for now silent
    } finally {
      setVisitSubmitting(false);
    }
  };

  const handleUnassignVisit = async () => {
    if (!lead?._id || !localVisitAssignee) return;
    setVisitSubmitting(true);
    try {
      await leadsService.unassignVisit(lead._id);
      setLocalVisitAssignee(null);
      if (onVisitChanged) onVisitChanged();
    } catch (_) {
      // silent
    } finally {
      setVisitSubmitting(false);
    }
  };

  const nextStage = useMemo(() => findNextStage(lead || {}, stages), [lead, stages]);

  if (!lead) return null;

  const isFinal = lead.currentStageId?.isFinal;
  const isClosed = lead.status !== 'active';
  const hasMovedOnce = !!lead.actualStageAt;
  const isVisitStage =
    (lead.currentStageId?.name || '').trim().toLowerCase() === 'visit confirmed';
  const isVisitConfirmedStage = Number(lead.currentStageId?.order) === 4;

  const openStageChange = () => {
    if (isVisitStage) setVisitReportOpen(true);
    else setStageDialog({ open: true, mode: 'complete' });
  };

  const handleVisitReportSubmit = async (reportData) => {
    await onCompleteVisit(lead._id, reportData, nextStage?._id);
    setVisitReportOpen(false);
    loadVisitReports(lead._id);
  };

  const handleLogCall = async (payload) => {
    await leadsService.logCall(lead._id, payload);
    loadCalls(lead._id);
  };

  const handleSendWhatsapp = async (payload) => {
    await leadsService.sendWhatsapp(lead._id, payload);
    loadWhatsapps(lead._id);
  };

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
    const hasChanges = Object.keys(payload).length > 0;
    if (!hasChanges && !comment.trim()) {
      return;
    }
    // A comment is mandatory whenever a date/value change is being saved.
    if (hasChanges && !comment.trim()) {
      setProgressError('Please add a comment before saving this change.');
      return;
    }
    setProgressError('');
    if (hasChanges) {
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

  const handleConfirmMove = async (targetStageId, moveComment) => {
    if (!targetStageId) return;
    await onCompleteStage(lead._id, targetStageId, false, moveComment);
    setStageDialog({ open: false, mode: 'move' });
  };

  const handleConfirmWon = async (wonComment) => {
    await onCompleteStage(lead._id, null, true, wonComment);
    setStageDialog({ open: false, mode: 'move' });
  };

  const handleConfirmUndo = async (undoComment) => {
    await onUndoStage(lead._id, undoComment);
    setStageDialog({ open: false, mode: 'move' });
  };

  const handleUndoStage = () => {
    if (isVisitConfirmedStage && isAdmin) {
      setMoveBackOpen(true);
    } else {
      setStageDialog({ open: true, mode: 'undo' });
    }
  };

  const handleMoveBackConfirm = async (payload) => {
    const updated = await leadsService.moveBackFromVisit(lead._id, payload);
    if (updated) {
      // optimistic — modal will close, parent reloads via onVisitChanged
    }
    if (typeof onVisitChanged === 'function') onVisitChanged();
  };

  const handleDrop = async (reason) => {
    await onDropLead(lead._id, reason);
    setDropOpen(false);
  };

  const enquiry = lead.enquiryId || {};

  const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'timeline', label: 'Timeline' },
    { key: 'comms', label: 'Calls & WhatsApp', count: calls.length + whatsapps.length },
    { key: 'visits', label: 'Visits', count: visitReports.length },
    isAdmin && { key: 'history', label: 'History' },
  ].filter(Boolean);

  return (
    <>
      <Modal
        open={open && !visitReportOpen}
        onClose={onClose}
        title="Lead Details"
        subtitle={enquiry.clientName ? `${enquiry.clientName} · ${shortCode(enquiry._id, 'ENQ')}` : ''}
        width="max-w-3xl"
        footer={
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {canEdit && (
                <button
                  type="button"
                  onClick={() => setCallModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L16 13l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Call
                </button>
              )}
              {canEdit && (
                <button
                  type="button"
                  onClick={() => setWhatsappOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                  </svg>
                  {Number(lead.currentStageId?.order) === 2 ? 'WhatsApp Confirmation' : 'WhatsApp'}
                </button>
              )}
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
              {canMoveStage && !isClosed && !isFinal && (
                <Button
                  variant="primary"
                  onClick={openStageChange}
                  disabled={saving || (!isVisitStage && !nextStage)}
                  className="!gap-1.5 !rounded-md !px-3 !py-1.5 !text-xs"
                  title={
                    !isVisitStage && !nextStage
                      ? 'No next stage configured'
                      : undefined
                  }
                >
                  {isVisitStage ? 'Complete Visit' : 'Complete Stage'}
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

          {/* Sticky header — at-a-glance badges + tab bar */}
          <div className="sticky -top-5 z-20 -mx-5 -mt-5 border-b border-slate-200 bg-white pt-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-1.5 px-5 pb-2.5">
              {lead.currentStageId && <LeadStageBadge stage={lead.currentStageId} />}
              <LeadStatusBadge status={lead.status} />
              {lead.temperature && <TemperatureChip value={lead.temperature} />}
              {lead.isWalkIn && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                  🚶 Walk-in
                </span>
              )}
            </div>
            <div className="no-scrollbar flex gap-1 overflow-x-auto px-4 pb-1.5">
              {TABS.map((t) => {
                const active = activeTab === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setActiveTab(t.key)}
                    className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? 'bg-brand-500 text-white shadow-sm'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                  >
                    {t.label}
                    {typeof t.count === 'number' && (
                      <span className={`ml-1 ${active ? 'text-white/80' : 'text-slate-400'}`}>
                        {t.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ===== TAB: Overview ===== */}
          {activeTab === 'overview' && (
          <div className="space-y-5">
          {/* Section 1 — Client Information */}
          <section className="space-y-2">
            <SectionHeader>Client Information</SectionHeader>
            {lead.isWalkIn && (
              <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                <span aria-hidden="true">🚶</span>
                Walk-in Client · Direct visit, no prior enquiry
              </div>
            )}
            {lead.linkedPreviousLeadId && (
              <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs text-violet-800">
                <p className="flex items-center gap-1.5 font-semibold">
                  <span aria-hidden="true">🔗</span>
                  Previously associated with another sales person
                </p>
                <p className="mt-1">
                  Original lead by{' '}
                  <strong>
                    {lead.linkedPreviousLeadId.assignedTo?.name ||
                      lead.linkedPreviousLeadId.createdBy?.name ||
                      'Unknown'}
                  </strong>
                  {lead.linkedPreviousLeadId.createdAt && (
                    <>
                      {' '}· created{' '}
                      {new Date(lead.linkedPreviousLeadId.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </>
                  )}{' '}· <span className="italic">idle, no activity</span>
                </p>
              </div>
            )}
            {lead.linkedClosedLeadId && (
              <PreviousLeadHistoryPanel prevLead={lead.linkedClosedLeadId} />
            )}
            {!lead.linkedPreviousLeadId && lead.linkedPreviousEnquiryId && (
              <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs text-violet-800">
                <p className="flex items-center gap-1.5 font-semibold">
                  <span aria-hidden="true">🔗</span>
                  Previously added by another user
                </p>
                <p className="mt-1">
                  Earlier enquiry by{' '}
                  <strong>
                    {lead.linkedPreviousEnquiryId.createdBy?.name || 'Unknown'}
                  </strong>
                  {lead.linkedPreviousEnquiryId.createdAt && (
                    <>
                      {' '}· created{' '}
                      {new Date(lead.linkedPreviousEnquiryId.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </>
                  )}{' '}· <span className="italic">never qualified, no activity</span>
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
              <InfoRow label="Client Name" value={enquiry.clientName} />
              <InfoRow label="Company" value={enquiry.companyName} />
              <InfoRow label="Phone" value={enquiry.clientPhone} />
              <InfoRow label="Email" value={enquiry.clientEmail} />
              <InfoRow label="City" value={enquiry.city} />
              <InfoRow label="Occupation" value={enquiry.occupation} />
            </div>
          </section>

          <div className="border-t border-slate-100" />

          {/* Section — Lead Information */}
          <section className="space-y-2">
            <SectionHeader>Lead Information</SectionHeader>
            <div className="grid grid-cols-1 gap-x-3 gap-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Status
                </p>
                <LeadStatusBadge status={lead.status} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Temperature
                </p>
                {canEdit && !isClosed ? (
                  <div className="flex items-center gap-2">
                    <TemperatureChip value={lead.temperature || 'cold'} />
                    <select
                      value={lead.temperature || 'cold'}
                      onChange={async (e) => {
                        try {
                          await onSaveProgress(lead._id, { temperature: e.target.value });
                        } catch (_) {
                          // saveError handled in state
                        }
                      }}
                      disabled={saving}
                      className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] text-slate-600 focus:border-brand-300 focus:outline-none focus:ring-1 focus:ring-brand-200"
                    >
                      {TEMPERATURE_OPTIONS.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <TemperatureChip value={lead.temperature || 'cold'} />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Assigned To
                </p>
                {lead.assignedTo ? (
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-800">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-[10px] font-semibold text-brand-700">
                      {initialsOf(lead.assignedTo.name)}
                    </span>
                    <span className="truncate">{lead.assignedTo.name}</span>
                  </span>
                ) : (
                  <span className="text-sm text-slate-300">— Unassigned —</span>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Assignment Method
                </p>
                {lead.assignedTo ? (
                  latestAssignment ? (
                    <AutoAssignedBadge assignment={latestAssignment} />
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                      Assigned
                    </span>
                  )
                ) : (
                  <span className="text-sm text-slate-300">—</span>
                )}
              </div>

              {/* Visit assigned */}
              <div className="space-y-1 sm:col-span-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Visit Assigned To
                </p>
                {visitEditing ? (
                  <div className="flex flex-wrap items-end gap-2">
                    <div className="min-w-[220px] flex-1 sm:flex-none">
                      <SelectInput
                        placeholder="Select Visit Team member"
                        options={visitMembers.map((u) => ({ value: u._id, label: u.name }))}
                        value={visitSelected}
                        onChange={(e) => setVisitSelected(e.target.value)}
                        disabled={visitSubmitting}
                        className="!py-1.5 !text-sm"
                      />
                    </div>
                    <Button
                      variant="primary"
                      onClick={submitVisitAssign}
                      loading={visitSubmitting}
                      disabled={visitSubmitting || !visitSelected}
                      className="!gap-1.5 !rounded-md !px-3 !py-1.5 !text-xs"
                    >
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setVisitEditing(false)}
                      disabled={visitSubmitting}
                      className="!gap-1.5 !rounded-md !px-3 !py-1.5 !text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    {localVisitAssignee ? (
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-800">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-[10px] font-semibold text-brand-700">
                          {initialsOf(localVisitAssignee.name)}
                        </span>
                        {localVisitAssignee.name}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-300">— Not assigned —</span>
                    )}
                    {canAssign && !isClosed && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={startEditVisit}
                          disabled={visitSubmitting}
                          className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-brand-600 transition-colors hover:border-brand-200 hover:bg-brand-50 disabled:opacity-50"
                        >
                          {localVisitAssignee ? 'Change' : 'Assign'}
                        </button>
                        {localVisitAssignee && (
                          <button
                            type="button"
                            onClick={handleUnassignVisit}
                            disabled={visitSubmitting}
                            className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-rose-600 transition-colors hover:border-rose-200 hover:bg-rose-50 disabled:opacity-50"
                          >
                            Unassign
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
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
                onChange={(e) => {
                  setComment(e.target.value);
                  if (progressError) setProgressError('');
                }}
              />
              {progressError ? (
                <p className="text-[11px] font-medium text-rose-600">{progressError}</p>
              ) : (
                <p className="text-[11px] text-slate-500">
                  A comment is required when saving any date/value change.
                </p>
              )}
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
              canUndo={
                canMoveStage &&
                hasMovedOnce &&
                !isClosed &&
                (!isVisitConfirmedStage || isAdmin)
              }
              onUndo={handleUndoStage}
              undoing={saving}
            />
          </section>
          </div>
          )}

          {/* ===== TAB: History ===== */}
          {activeTab === 'history' && (
          <div className="space-y-5">
          {/* Section — Assignment History (#31) */}
          <section className="space-y-2">
            <SectionHeader>Assignment History</SectionHeader>
            <AssignmentHistoryPanel leadId={lead._id} />
          </section>
          </div>
          )}

          {/* ===== TAB: Calls & WhatsApp ===== */}
          {activeTab === 'comms' && (
          <div className="space-y-5">
          {/* Section — Call History */}
          <section className="space-y-2">
            <SectionHeader>Call History ({calls.length})</SectionHeader>
            {calls.length === 0 ? (
              <p className="text-xs italic text-slate-400">No calls logged yet.</p>
            ) : (
              <div className="space-y-2">
                {calls.map((c) => (
                  <div
                    key={c._id}
                    className="rounded-lg border border-slate-200 bg-white p-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            CALL_OUTCOME_TONE[c.outcome] || 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {CALL_OUTCOME_LABEL[c.outcome] || c.outcome}
                        </span>
                        {c.durationSeconds > 0 && (
                          <span className="text-[11px] text-slate-500">
                            ⏱ {formatDuration(c.durationSeconds)}
                          </span>
                        )}
                        {c.recordingUrl && (
                          <a
                            href={c.recordingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-medium text-brand-600 hover:underline"
                          >
                            ▶ Recording
                          </a>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {formatDateTime(c.calledAt || c.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {c.calledBy?.name ? `By ${c.calledBy.name}` : ''}
                      {c.phoneNumber ? ` · ${c.phoneNumber}` : ''}
                      {c.stageName ? ` · ${c.stageName}` : ''}
                    </p>
                    {c.notes && (
                      <p className="mt-1 whitespace-pre-wrap text-[12px] text-slate-700">
                        {c.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="border-t border-slate-100" />

          {/* Section — WhatsApp History */}
          <section className="space-y-2">
            <SectionHeader>WhatsApp History ({whatsapps.length})</SectionHeader>
            {whatsapps.length === 0 ? (
              <p className="text-xs italic text-slate-400">No WhatsApp messages yet.</p>
            ) : (
              <div className="space-y-2">
                {whatsapps.map((w) => (
                  <div key={w._id} className="rounded-lg border border-slate-200 bg-white p-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            w.direction === 'inbound'
                              ? 'bg-sky-100 text-sky-700'
                              : WA_STATUS_TONE[w.status] || 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {w.direction === 'inbound' ? 'Reply' : w.status}
                        </span>
                        {w.templateName && (
                          <span className="text-[10px] text-slate-400">template: {w.templateName}</span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {formatDateTime(w.sentAt || w.createdAt)}
                      </span>
                    </div>
                    {w.body && (
                      <p className="mt-1 whitespace-pre-wrap text-[12px] text-slate-700">{w.body}</p>
                    )}
                    <p className="mt-1 text-[11px] text-slate-500">
                      {w.direction === 'inbound'
                        ? `From ${w.toNumber}`
                        : `${w.sentBy?.name ? `By ${w.sentBy.name}` : ''}${w.toNumber ? ` · to ${w.toNumber}` : ''}`}
                    </p>
                    {w.errorMessage && (
                      <p className="mt-1 text-[11px] text-rose-600">{w.errorMessage}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
          </div>
          )}

          {/* ===== TAB: Visits ===== */}
          {activeTab === 'visits' && (
          <div className="space-y-5">
          {visitReports.length === 0 && (
            <p className="text-xs italic text-slate-400">No visit reports yet.</p>
          )}
          {/* Visit Reports */}
          {visitReports.length > 0 && (
            <>
              <section className="space-y-2">
                <SectionHeader>Visit Reports ({visitReports.length})</SectionHeader>
                <div className="space-y-2">
                  {visitReports.map((r) => (
                    <div
                      key={r._id}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-[10px] font-semibold text-brand-600">
                          {r.visitNumber || '1st'} visit
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {formatDate(r.visitedAt || r.createdAt)}
                        </span>
                      </div>

                      {/* Location verification (where the form was filled) */}
                      {(typeof r.submittedLat === 'number' || r.geoVerified) && (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {r.geoVerified ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                              📍 Location verified
                              {typeof r.geoDistanceMeters === 'number' &&
                                ` · ${r.geoDistanceMeters}m`}
                              {r.geoMatchedLocation &&
                                r.geoMatchedLocation !== 'no-locations-configured' &&
                                ` from ${r.geoMatchedLocation}`}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                              📍 Location captured (no geo-fence configured)
                            </span>
                          )}
                          {typeof r.submittedLat === 'number' &&
                            typeof r.submittedLng === 'number' && (
                              <a
                                href={`https://www.google.com/maps?q=${r.submittedLat},${r.submittedLng}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] font-medium text-brand-600 hover:underline"
                              >
                                View on map
                              </a>
                            )}
                        </div>
                      )}

                      <div className="mt-2 grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2">
                        <InfoRow label="Customer" value={r.customerName} />
                        <InfoRow label="Contact" value={r.contactNumber} />
                        <InfoRow label="Sales Person" value={r.salesPersonName} />
                        <InfoRow label="Visitor" value={r.visitorName} />
                        <InfoRow label="Project Visited" value={r.projectVisited} />
                        <InfoRow label="Property Interested" value={r.propertyInterested} />
                        {(r.firstPreference || r.secondPreference) && (
                          <div className="sm:col-span-2 rounded-lg border border-emerald-200 bg-emerald-50/50 p-2">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                              Property Preferences
                            </p>
                            <div className="mt-1 grid grid-cols-1 gap-1.5 text-[12px] text-emerald-900 sm:grid-cols-2">
                              <div>
                                <span className="text-emerald-600">1st Preference: </span>
                                <strong>{r.firstPreference || '—'}</strong>
                              </div>
                              <div>
                                <span className="text-emerald-600">2nd Preference: </span>
                                <strong>{r.secondPreference || '—'}</strong>
                              </div>
                            </div>
                          </div>
                        )}
                        <InfoRow label="Budget" value={r.customerBudget} />
                        <InfoRow label="Profession" value={r.customerProfession} />
                        <InfoRow label="Source" value={r.sourceOfCustomer} />
                        <InfoRow label="Meeting Person (At Office)" value={r.seniorPerson} />
                        <div className="sm:col-span-2">
                          <InfoRow label="Address" value={r.customerAddress} />
                        </div>
                      </div>
                      {r.photoUrl && (
                        <div className="mt-3">
                          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            Visit Photo
                          </p>
                          <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                            <a href={r.photoUrl} target="_blank" rel="noreferrer" className="block">
                              <img
                                src={r.photoUrl}
                                alt="Visit"
                                className="max-h-72 w-full object-contain"
                              />
                            </a>
                            <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-white px-2 py-1.5">
                              <a
                                href={r.photoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                  <path d="M15 3h6v6M14 10l7-7M5 21h14a2 2 0 0 0 2-2v-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Open
                              </a>
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    const resp = await fetch(r.photoUrl);
                                    const blob = await resp.blob();
                                    const blobUrl = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = blobUrl;
                                    const ext = (r.photoUrl.split('.').pop() || 'jpg').split('?')[0];
                                    a.download = `visit-${r._id || 'photo'}.${ext}`;
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                    URL.revokeObjectURL(blobUrl);
                                  } catch (_) {
                                    window.open(r.photoUrl, '_blank');
                                  }
                                }}
                                className="inline-flex items-center gap-1 rounded-md bg-brand-500 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-brand-600"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                  <path d="M12 4v12m0 0-4-4m4 4 4-4M4 20h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Download
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
          </div>
          )}

          {/* ===== TAB: Timeline ===== */}
          {activeTab === 'timeline' && (
          <div className="space-y-5">
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
          </div>
          )}

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
        nextStage={nextStage}
        saving={saving}
        onClose={() => setStageDialog({ open: false, mode: 'move' })}
        onConfirmMove={handleConfirmMove}
        onConfirmWon={handleConfirmWon}
        onConfirmUndo={handleConfirmUndo}
      />

      <VisitReportModal
        open={visitReportOpen}
        lead={lead}
        nextStage={nextStage}
        saving={saving}
        saveError={saveError}
        onClose={() => setVisitReportOpen(false)}
        onSubmit={handleVisitReportSubmit}
      />

      <MoveBackFromVisitModal
        open={moveBackOpen}
        lead={lead}
        stages={stages}
        onClose={() => setMoveBackOpen(false)}
        onConfirm={handleMoveBackConfirm}
      />

      <CallLogModal
        open={callModalOpen}
        lead={lead}
        onClose={() => setCallModalOpen(false)}
        onSubmit={handleLogCall}
      />

      <WhatsappModal
        open={whatsappOpen}
        lead={lead}
        onClose={() => setWhatsappOpen(false)}
        onSent={handleSendWhatsapp}
      />
    </>
  );
}
