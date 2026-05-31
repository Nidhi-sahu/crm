import { useState } from 'react';
import { leadsService } from '../services/leadsService';

const formatDate = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

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

const STATUS_LABEL = {
  active: 'Active',
  won: 'Won',
  lost: 'Lost',
  dropped: 'Dropped',
  closed: 'Closed',
  rejected: 'Rejected',
};

export function PreviousLeadHistoryPanel({ prevLead }) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [history, setHistory] = useState([]);
  const [visitReports, setVisitReports] = useState([]);
  const [comments, setComments] = useState([]);
  const [error, setError] = useState('');

  if (!prevLead) return null;

  const loadFullHistory = async () => {
    if (loaded || loading) return;
    setLoading(true);
    setError('');
    try {
      const [h, vr, cm] = await Promise.all([
        leadsService.getHistory(prevLead._id).catch(() => []),
        leadsService.listVisitReports(prevLead._id).catch(() => []),
        leadsService.listComments(prevLead._id).catch(() => []),
      ]);
      setHistory(h || []);
      setVisitReports(vr || []);
      setComments(cm || []);
      setLoaded(true);
    } catch (_) {
      setError('Could not load full history');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = () => {
    const next = !expanded;
    setExpanded(next);
    if (next) loadFullHistory();
  };

  const assigneeName =
    prevLead.assignedTo?.name || prevLead.createdBy?.name || 'Unknown';
  const status = prevLead.status || '—';
  const statusLabel = STATUS_LABEL[status] || status;
  const lastActivity = prevLead.lastActivityAt || prevLead.closedAt || prevLead.updatedAt;
  const stageName = prevLead.currentStageId?.name;
  const clientName = prevLead.enquiryId?.clientName;
  const lostReason = prevLead.lostReason;

  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-rose-800">
            <span aria-hidden="true">⚠</span>
            Previous Lead History Found
          </p>
          <p className="mt-0.5 text-[11px] text-rose-700">
            This customer has interacted with the CRM previously.
          </p>
        </div>
        <button
          type="button"
          onClick={toggleExpand}
          className="shrink-0 rounded-md border border-rose-300 bg-white px-2 py-1 text-[11px] font-medium text-rose-700 hover:bg-rose-100"
        >
          {expanded ? 'Hide details' : 'View full history'}
        </button>
      </div>

      {/* Summary always visible */}
      <div className="mt-2 grid grid-cols-1 gap-1.5 text-[11px] text-rose-900 sm:grid-cols-2">
        <div>
          <span className="text-rose-600">Previous Sales Person:</span>{' '}
          <strong>{assigneeName}</strong>
        </div>
        <div>
          <span className="text-rose-600">Previous Status:</span>{' '}
          <strong className="capitalize">{statusLabel}</strong>
        </div>
        <div>
          <span className="text-rose-600">Last Activity:</span>{' '}
          <strong>{formatDate(lastActivity)}</strong>
        </div>
        {stageName && (
          <div>
            <span className="text-rose-600">Last Stage:</span>{' '}
            <strong>{stageName}</strong>
          </div>
        )}
        {clientName && (
          <div className="sm:col-span-2">
            <span className="text-rose-600">Recorded as:</span>{' '}
            <strong>{clientName}</strong>
          </div>
        )}
        {lostReason && (
          <div className="sm:col-span-2">
            <span className="text-rose-600">Drop / Close Reason:</span>{' '}
            <em>{lostReason}</em>
          </div>
        )}
      </div>

      {expanded && (
        <div className="mt-3 space-y-3 border-t border-rose-200 pt-3">
          {loading && (
            <p className="text-[11px] italic text-rose-700">Loading history…</p>
          )}
          {error && <p className="text-[11px] text-rose-700">{error}</p>}

          {loaded && (
            <>
              {/* Stage History */}
              <section>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-rose-700">
                  Stage History ({history.length})
                </p>
                {history.length === 0 ? (
                  <p className="text-[11px] italic text-rose-600">No stage changes recorded.</p>
                ) : (
                  <ul className="space-y-1 text-[11px] text-rose-900">
                    {history.map((h) => (
                      <li key={h._id} className="flex flex-wrap items-center gap-1">
                        <span className="font-medium">{h.fromStageName || '—'}</span>
                        <span className="text-rose-500">→</span>
                        <span className="font-medium">{h.toStageName || '—'}</span>
                        <span className="text-rose-600">· {formatDateTime(h.movedAt)}</span>
                        {h.comment && (
                          <span className="ml-1 italic text-rose-700">— {h.comment}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Comments / Remarks */}
              <section>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-rose-700">
                  Comments / Remarks ({comments.length})
                </p>
                {comments.length === 0 ? (
                  <p className="text-[11px] italic text-rose-600">No comments recorded.</p>
                ) : (
                  <ul className="space-y-1 text-[11px] text-rose-900">
                    {comments.map((c) => (
                      <li key={c._id} className="rounded-md bg-white/60 px-2 py-1">
                        <span className="text-rose-700">
                          {c.createdBy?.name || 'Unknown'} · {formatDateTime(c.createdAt)}
                        </span>
                        <p className="mt-0.5 text-rose-900">{c.comment}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Visit Reports */}
              <section>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-rose-700">
                  Visit Reports ({visitReports.length})
                </p>
                {visitReports.length === 0 ? (
                  <p className="text-[11px] italic text-rose-600">No visit reports recorded.</p>
                ) : (
                  <ul className="space-y-1 text-[11px] text-rose-900">
                    {visitReports.map((r) => (
                      <li key={r._id} className="rounded-md bg-white/60 px-2 py-1">
                        <span className="text-rose-700">
                          {r.visitNumber || ''} · {formatDate(r.visitedAt)}
                          {r.salesPersonName && ` · ${r.salesPersonName}`}
                        </span>
                        {r.propertyInterested && (
                          <p className="mt-0.5 text-rose-900">
                            <span className="text-rose-600">Interested in:</span>{' '}
                            {r.propertyInterested}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </div>
      )}
    </div>
  );
}
