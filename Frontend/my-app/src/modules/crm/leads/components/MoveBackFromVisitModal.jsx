import { useEffect, useState } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { SelectInput } from '../../../../shared/components/SelectInput';
import { Textarea } from '../../../../shared/components/Textarea';
import { Alert } from '../../../../shared/components/Alert';
import { leadsService } from '../services/leadsService';

export function MoveBackFromVisitModal({ open, lead, stages, onClose, onConfirm }) {
  const [stageOrder, setStageOrder] = useState('');
  const [telesalesId, setTelesalesId] = useState('');
  const [reason, setReason] = useState('');
  const [telesalesUsers, setTelesalesUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setStageOrder('');
      setTelesalesId('');
      setReason('');
      setError('');
      return;
    }
    setLoading(true);
    leadsService
      .listTeleSalesUsers()
      .then(setTelesalesUsers)
      .catch(() => setTelesalesUsers([]))
      .finally(() => setLoading(false));
  }, [open]);

  if (!lead) return null;

  const previousStages = (stages || [])
    .filter((s) => Number(s.order) < 4)
    .sort((a, b) => a.order - b.order);

  const reasonMissing = reason.trim().length < 15;
  const submitDisabled =
    !stageOrder || !telesalesId || reasonMissing || submitting;

  const handleConfirm = async () => {
    if (submitDisabled) return;
    setSubmitting(true);
    setError('');
    try {
      await onConfirm({
        targetStageOrder: Number(stageOrder),
        telesalesAssignedTo: telesalesId,
        reason: reason.trim(),
      });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to move lead back');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Move Back to Telesales"
      subtitle="Admin-only — choose an earlier stage and reassign to a telesales executive"
      width="max-w-lg"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={submitDisabled}
            loading={submitting}
          >
            Confirm Move Back
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {error && <Alert tone="error" title="Couldn't save">{error}</Alert>}

        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-600">
            Move back to stage *
          </label>
          <SelectInput
            value={stageOrder}
            onChange={(e) => setStageOrder(e.target.value)}
            options={[
              { value: '', label: 'Select target stage' },
              ...previousStages.map((s) => ({
                value: String(s.order),
                label: `${s.order}. ${s.name}`,
              })),
            ]}
          />
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-600">
            Telesales Executive *
          </label>
          <SelectInput
            value={telesalesId}
            onChange={(e) => setTelesalesId(e.target.value)}
            disabled={loading}
            options={[
              {
                value: '',
                label: loading
                  ? 'Loading…'
                  : telesalesUsers.length
                  ? 'Select telesales executive'
                  : 'No telesales users found',
              },
              ...telesalesUsers.map((u) => ({
                value: u._id,
                label: u.name ? `${u.name}${u.email ? ` · ${u.email}` : ''}` : u.email,
              })),
            ]}
          />
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-600">
            Reason for moving back *
          </label>
          <Textarea
            rows={3}
            placeholder="Why is this lead being moved back? (min 15 characters)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          {reasonMissing && reason.length > 0 && (
            <p className="mt-1 text-[11px] text-rose-600">
              Reason must be at least 15 characters.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
