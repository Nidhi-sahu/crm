import { useEffect, useState } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { SelectInput } from '../../../../shared/components/SelectInput';

export function StageMoveDialog({
  open,
  mode = 'move', // 'move' | 'won'
  lead,
  stages,
  saving,
  onClose,
  onConfirmMove,
  onConfirmWon,
}) {
  const [targetId, setTargetId] = useState('');

  const currentId = lead?.currentStageId?._id || lead?.currentStageId || '';

  useEffect(() => {
    if (!open) {
      setTargetId('');
    }
  }, [open]);

  if (!lead) return null;

  const ordered = [...(stages || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
  const currentStage = ordered.find((s) => String(s._id) === String(currentId));
  const isWon = mode === 'won';

  const stageOptions = ordered
    .filter((s) => String(s._id) !== String(currentId))
    .map((s) => ({ value: s._id, label: `${s.order}. ${s.name}` }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isWon ? 'Mark Lead as Won' : 'Change Stage'}
      width="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          {isWon ? (
            <Button variant="primary" onClick={onConfirmWon} loading={saving} disabled={saving}>
              Confirm — Mark Won
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => onConfirmMove(targetId)}
              loading={saving}
              disabled={saving || !targetId}
            >
              Confirm Move
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-4 py-1">
        {isWon ? (
          <>
            <p className="text-sm text-slate-700">
              This will close the lead as <strong>Converted (Won)</strong>.
            </p>
            <div className="flex items-center justify-center rounded-lg bg-emerald-50 px-3 py-3">
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                {currentStage?.name || 'Final Deal'} → Won
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-0.5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Current Stage
              </p>
              <p className="text-sm font-medium text-slate-800">
                {currentStage ? `${currentStage.order}. ${currentStage.name}` : '—'}
              </p>
            </div>

            <SelectInput
              label="Move to stage"
              placeholder="Select a stage"
              options={stageOptions}
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
            />

            <p className="text-[11px] text-slate-500">
              Lead ko kisi bhi stage pe move kar sakte ho — pipeline ke aage ya peeche.
            </p>
          </>
        )}
      </div>
    </Modal>
  );
}
