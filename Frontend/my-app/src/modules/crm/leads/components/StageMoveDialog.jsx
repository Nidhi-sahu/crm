import { useEffect, useState } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { SelectInput } from '../../../../shared/components/SelectInput';
import { Textarea } from '../../../../shared/components/Textarea';

export function StageMoveDialog({
  open,
  mode = 'move', // 'move' | 'won' | 'undo'
  lead,
  stages,
  saving,
  onClose,
  onConfirmMove,
  onConfirmWon,
  onConfirmUndo,
}) {
  const [targetId, setTargetId] = useState('');
  const [comment, setComment] = useState('');

  const currentId = lead?.currentStageId?._id || lead?.currentStageId || '';

  useEffect(() => {
    if (!open) {
      setTargetId('');
      setComment('');
    }
  }, [open]);

  if (!lead) return null;

  const ordered = [...(stages || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
  const currentStage = ordered.find((s) => String(s._id) === String(currentId));
  const isWon = mode === 'won';
  const isUndo = mode === 'undo';

  const stageOptions = ordered
    .filter((s) => String(s._id) !== String(currentId))
    .map((s) => ({ value: s._id, label: `${s.order}. ${s.name}` }));

  const commentMissing = !comment.trim();

  const title = isWon ? 'Mark Lead as Won' : isUndo ? 'Undo Stage Move' : 'Change Stage';

  const handleConfirm = () => {
    if (commentMissing) return;
    if (isWon) onConfirmWon(comment.trim());
    else if (isUndo) onConfirmUndo(comment.trim());
    else onConfirmMove(targetId, comment.trim());
  };

  const confirmDisabled =
    saving || commentMissing || (!isWon && !isUndo && !targetId);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      width="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm} loading={saving} disabled={confirmDisabled}>
            {isWon ? 'Confirm — Mark Won' : isUndo ? 'Confirm Undo' : 'Confirm Move'}
          </Button>
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
        ) : isUndo ? (
          <p className="text-sm text-slate-700">
            This will revert the lead to its <strong>previous stage</strong>. Add a reason below.
          </p>
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
          </>
        )}

        <div>
          <Textarea
            label="Comment *"
            rows={3}
            placeholder="Add a remark for this change…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          {commentMissing && (
            <p className="mt-1 text-[11px] text-slate-400">
              A comment is required before this change.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
