import { useEffect, useState } from 'react';
import { Modal } from '../../../../shared/components/Modal';
import { Button } from '../../../../shared/components/Button';
import { Textarea } from '../../../../shared/components/Textarea';
import { Input } from '../../../../shared/components/Input';
import { Alert } from '../../../../shared/components/Alert';
import { Skeleton } from '../../dashboard/components/Skeleton';
import { formatDateTime, initialsOf } from '../utils/leadFormatters';

export function LeadCommentsModal({
  open,
  lead,
  comments,
  loading,
  saving,
  onClose,
  onAddComment,
}) {
  const [comment, setComment] = useState('');
  const [followupDate, setFollowupDate] = useState('');
  const [followupTime, setFollowupTime] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) {
      setComment('');
      setFollowupDate('');
      setFollowupTime('');
      setError(null);
    }
  }, [open]);

  if (!lead) return null;

  const submit = async () => {
    if (!comment.trim()) {
      setError({ message: 'Comment cannot be empty' });
      return;
    }
    setError(null);
    try {
      await onAddComment({
        leadId: lead._id,
        comment: comment.trim(),
        nextFollowupDate: followupDate || null,
        nextFollowupTime: followupTime || '',
      });
      setComment('');
      setFollowupDate('');
      setFollowupTime('');
    } catch (err) {
      setError({ message: err?.message || 'Failed to add comment' });
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Lead Comments"
      subtitle={lead.enquiryId?.clientName ? `For ${lead.enquiryId.clientName}` : ''}
      width="max-w-lg"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>Close</Button>
          <Button variant="primary" onClick={submit} disabled={saving || !comment.trim()} loading={saving}>
            Add Comment
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {error?.message && <Alert tone="error">{error.message}</Alert>}

        {/* Composer */}
        <section className="space-y-2">
          <Textarea
            label="New comment"
            rows={3}
            placeholder="Add a quick note, observation, or followup detail…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Input
              label="Reminder Date"
              type="date"
              value={followupDate}
              onChange={(e) => setFollowupDate(e.target.value)}
            />
            <Input
              label="Reminder Time"
              type="time"
              value={followupTime}
              onChange={(e) => setFollowupTime(e.target.value)}
            />
          </div>
        </section>

        <div className="border-t border-slate-100" />

        {/* List */}
        <section className="space-y-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-brand-600">
            Comment History
          </h3>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full" rounded="rounded-lg" />
              <Skeleton className="h-14 w-full" rounded="rounded-lg" />
            </div>
          ) : !comments || comments.length === 0 ? (
            <p className="text-xs text-slate-500">No comments yet — add the first one.</p>
          ) : (
            <ul className="space-y-2">
              {comments.map((c) => (
                <li
                  key={c._id}
                  className="rounded-lg border border-slate-200 bg-white p-2.5"
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[10px] font-semibold text-brand-700">
                      {initialsOf(c.createdBy?.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-500">
                        <span className="font-medium text-slate-700">
                          {c.createdBy?.name || 'User'}
                        </span>
                        {' · '}
                        {formatDateTime(c.createdAt)}
                      </p>
                      <p className="mt-1 text-sm text-slate-800 break-words">{c.comment}</p>
                      {c.nextFollowupDate && (
                        <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                          Followup{' '}
                          {new Date(c.nextFollowupDate).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                          })}
                          {c.nextFollowupTime ? ` · ${c.nextFollowupTime}` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Modal>
  );
}
