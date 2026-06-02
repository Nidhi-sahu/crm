import { useEffect, useState } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { Input } from '../../../../shared/components/Input';
import { SelectInput } from '../../../../shared/components/SelectInput';
import { Textarea } from '../../../../shared/components/Textarea';
import { Alert } from '../../../../shared/components/Alert';

const OUTCOME_OPTIONS = [
  { value: 'connected', label: 'Connected' },
  { value: 'not_picked', label: 'Not Picked' },
  { value: 'busy', label: 'Busy' },
  { value: 'switched_off', label: 'Switched Off' },
  { value: 'wrong_number', label: 'Wrong Number' },
  { value: 'call_back_later', label: 'Call Back Later' },
];

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L16 13l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function CallLogModal({ open, lead, onClose, onSubmit }) {
  const enquiry = lead?.enquiryId || {};
  const phone = (enquiry.clientPhone || '').trim();

  const [outcome, setOutcome] = useState('connected');
  const [durationMin, setDurationMin] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setOutcome('connected');
    setDurationMin('');
    setNotes('');
    setError('');
  }, [open]);

  if (!lead) return null;

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const mins = Number(durationMin);
      await onSubmit({
        phoneNumber: phone,
        outcome,
        durationSeconds: Number.isFinite(mins) && mins > 0 ? Math.round(mins * 60) : 0,
        notes: notes.trim(),
        stageName: lead.currentStageId?.name || '',
      });
      onClose();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to save call log');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Log a Call"
      subtitle={enquiry.clientName ? `${enquiry.clientName}` : 'Lead'}
      width="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} loading={saving} disabled={saving}>
            Save Call Log
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {error && <Alert tone="error" title="Couldn't save">{error}</Alert>}

        {/* Click-to-call (opens the device dialer / paired phone) */}
        {phone ? (
          <a
            href={`tel:${phone}`}
            className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            <PhoneIcon />
            Call {phone}
          </a>
        ) : (
          <Alert tone="warning" title="No phone number">
            This lead has no phone number to call. You can still log a call manually below.
          </Alert>
        )}
        <p className="text-center text-[11px] text-slate-400">
          Tap “Call” to dial, then record the outcome below.
        </p>

        <SelectInput
          label="Call Outcome *"
          options={OUTCOME_OPTIONS}
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
        />
        <Input
          type="number"
          min="0"
          step="0.5"
          label="Duration (minutes)"
          placeholder="e.g. 3"
          value={durationMin}
          onChange={(e) => setDurationMin(e.target.value)}
        />
        <Textarea
          label="Notes"
          rows={3}
          placeholder="What was discussed on the call…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    </Modal>
  );
}
