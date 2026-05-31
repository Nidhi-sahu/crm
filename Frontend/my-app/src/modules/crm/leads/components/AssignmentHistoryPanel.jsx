import { useEffect, useState } from 'react';
import { leadsService } from '../services/leadsService';

const formatDateTime = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const TRIGGER_LABEL = {
  manual: 'Assigned',
  reassign: 'Reassigned',
  auto: 'Auto-assigned',
  unassign: 'Unassigned',
};

const TRIGGER_TONE = {
  manual: 'bg-emerald-100 text-emerald-700',
  reassign: 'bg-amber-100 text-amber-700',
  auto: 'bg-brand-100 text-brand-700',
  unassign: 'bg-rose-100 text-rose-700',
};

export function AssignmentHistoryPanel({ leadId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!leadId) return;
    let active = true;
    setLoading(true);
    setError('');
    leadsService
      .getAssignmentHistory(leadId)
      .then((data) => {
        if (active) setItems(data || []);
      })
      .catch(() => {
        if (active) setError('Could not load assignment history');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [leadId]);

  if (!leadId) return null;

  return (
    <div>
      {loading && (
        <p className="text-[11px] italic text-slate-500">Loading assignment history…</p>
      )}
      {error && <p className="text-[11px] text-rose-600">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <p className="text-[11px] italic text-slate-400">No assignments yet.</p>
      )}
      {!loading && items.length > 0 && (
        <ol className="space-y-2.5">
          {items.map((a, idx) => {
            const isLatest = idx === 0;
            const trigger = a.triggerType || 'manual';
            const label = TRIGGER_LABEL[trigger] || trigger;
            const tone = TRIGGER_TONE[trigger] || 'bg-slate-100 text-slate-700';
            return (
              <li
                key={a._id}
                className={`relative rounded-lg border px-3 py-2.5 ${
                  isLatest ? 'border-brand-200 bg-brand-50/50' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${tone}`}
                    >
                      {label}
                    </span>
                    {isLatest && (
                      <span className="text-[10px] font-medium uppercase tracking-wider text-brand-600">
                        Current
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {formatDateTime(a.assignedAt || a.createdAt)}
                  </span>
                </div>

                <div className="mt-1.5 grid grid-cols-1 gap-1 text-[12px] text-slate-800 sm:grid-cols-2">
                  {trigger !== 'unassign' && a.assignedTo && (
                    <div>
                      <span className="text-slate-500">To: </span>
                      <strong>{a.assignedTo.name || a.assignedTo.email || '—'}</strong>
                    </div>
                  )}
                  {a.previousAssignee && (
                    <div>
                      <span className="text-slate-500">From: </span>
                      <strong>
                        {a.previousAssignee.name || a.previousAssignee.email || '—'}
                      </strong>
                    </div>
                  )}
                  {a.assignedBy && (
                    <div>
                      <span className="text-slate-500">By: </span>
                      <strong>{a.assignedBy.name || a.assignedBy.email || '—'}</strong>
                    </div>
                  )}
                  {trigger === 'auto' && !a.assignedBy && (
                    <div>
                      <span className="text-slate-500">By: </span>
                      <em className="text-slate-600">System</em>
                    </div>
                  )}
                </div>

                {a.assignmentReason && (
                  <p className="mt-1.5 rounded bg-white/70 px-2 py-1 text-[11px] italic text-slate-700">
                    Reason: {a.assignmentReason}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
