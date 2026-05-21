import { useState, useEffect } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { SelectInput } from '../../../../shared/components/SelectInput';
import { Textarea } from '../../../../shared/components/Textarea';
import { DROP_REASONS } from '../constants/dropReasons';

export function DropLeadDialog({ open, lead, saving, onClose, onConfirm }) {
  const [reasonKey, setReasonKey] = useState('');
  const [customNote, setCustomNote] = useState('');

  useEffect(() => {
    if (!open) {
      setReasonKey('');
      setCustomNote('');
    }
  }, [open]);

  if (!lead) return null;

  const reasonLabel = DROP_REASONS.find((r) => r.value === reasonKey)?.label || '';
  const finalReason =
    reasonKey === 'other'
      ? customNote.trim()
      : customNote.trim()
      ? `${reasonLabel}: ${customNote.trim()}`
      : reasonLabel;

  const canConfirm = reasonKey && (reasonKey !== 'other' || customNote.trim().length >= 2);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Drop Lead"
      subtitle="Pick a reason — this can't be undone easily."
      width="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <button
            type="button"
            onClick={() => onConfirm(finalReason)}
            disabled={!canConfirm || saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Dropping…' : 'Drop Lead'}
          </button>
        </div>
      }
    >
      <div className="space-y-3 py-1">
        <SelectInput
          label="Reason *"
          placeholder="Select reason"
          options={DROP_REASONS}
          value={reasonKey}
          onChange={(e) => setReasonKey(e.target.value)}
        />
        <Textarea
          label={reasonKey === 'other' ? 'Custom reason *' : 'Additional note (optional)'}
          rows={2}
          placeholder={reasonKey === 'other' ? 'Describe the reason' : 'Add any context'}
          value={customNote}
          onChange={(e) => setCustomNote(e.target.value)}
        />
      </div>
    </Modal>
  );
}
