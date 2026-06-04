import { useEffect, useState } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { SelectInput } from '../../../../shared/components/SelectInput';
import { Textarea } from '../../../../shared/components/Textarea';
import { Alert } from '../../../../shared/components/Alert';
import { leadsService } from '../services/leadsService';
import { initialsOf, shortCode } from '../utils/leadFormatters';

const MIN_REASON = 15;

export function ReassignModal({ open, lead, onClose, onReassigned }) {
  const [salesPersons, setSalesPersons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setSelectedUserId('');
      setReason('');
      setError('');
      return;
    }
    setLoading(true);
    leadsService
      .listSalesPersons()
      .then((list) => setSalesPersons(list || []))
      .catch(() => setSalesPersons([]))
      .finally(() => setLoading(false));
  }, [open]);

  if (!lead) return null;

  const enquiry = lead.enquiryId || {};
  const currentId = lead.assignedTo?._id || lead.assignedTo || '';
  const options = salesPersons
    .filter((u) => String(u._id) !== String(currentId))
    .map((u) => ({
      value: u._id,
      label: u.name ? `${u.name}${u.email ? ` · ${u.email}` : ''}` : u.email,
    }));

  const reasonLen = reason.trim().length;
  const canSubmit = !!selectedUserId && reasonLen >= MIN_REASON && !saving;

  const handleConfirm = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setError('');
    try {
      await leadsService.assign(lead._id, selectedUserId, reason.trim());
      onReassigned?.();
      onClose?.();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Could not reassign lead');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reassign Lead"
      subtitle={`${enquiry.clientName || 'Lead'} · ${shortCode(enquiry._id || lead.enquiryId, 'ENQ')}`}
      width="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm} disabled={!canSubmit} loading={saving}>
            ↻ Reassign Lead
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {error && <Alert tone="error">{error}</Alert>}

        {/* Current assignee */}
        <div className="space-y-1">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
            Currently with
          </p>
          {lead.assignedTo ? (
            <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                {initialsOf(lead.assignedTo.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">
                  {lead.assignedTo.name || lead.assignedTo.email}
                </p>
                {lead.assignedTo.email && (
                  <p className="truncate text-[11px] text-slate-500">{lead.assignedTo.email}</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Unassigned</p>
          )}
        </div>

        {/* New assignee */}
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-600">
            Reassign To *
          </label>
          <SelectInput
            placeholder={loading ? 'Loading…' : 'Select sales person'}
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            disabled={loading}
            options={options}
          />
        </div>

        {/* Reason */}
        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-600">
            Reason for Reassignment *
          </label>
          <Textarea
            rows={3}
            placeholder="Why is this lead being reassigned? (min 15 characters)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <p
            className={`mt-1 text-[11px] ${
              reasonLen >= MIN_REASON ? 'text-emerald-600' : 'text-slate-400'
            }`}
          >
            {reasonLen}/{MIN_REASON} characters
          </p>
        </div>
      </div>
    </Modal>
  );
}
