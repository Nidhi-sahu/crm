import { formatDateTime } from '../utils/leadFormatters';

const userName = (u) => u?.name || u?.email || 'System';

const buildEvents = (lead, history, comments) => {
  const events = [];

  if (lead?.createdAt) {
    events.push({
      id: 'lead-created',
      verb: 'Lead created',
      actor: userName(lead.createdBy),
      at: lead.createdAt,
    });
  }

  (history || []).forEach((h, i) => {
    const fromName = h.fromStageId?.name || 'Start';
    const toName = h.toStageId?.name || 'Stage';
    events.push({
      id: `history-${h._id || i}`,
      verb: h.isUndo
        ? `Stage reverted: ${toName}`
        : `Stage moved: ${fromName} → ${toName}`,
      detail: h.comment || undefined,
      actor: userName(h.movedBy),
      at: h.movedAt || h.createdAt,
    });
  });

  (comments || []).forEach((c) => {
    events.push({
      id: `comment-${c._id}`,
      verb: 'Comment added',
      detail: c.comment,
      actor: userName(c.createdBy),
      at: c.createdAt,
    });
  });

  if (lead?.status === 'won' && lead.closedAt) {
    events.push({
      id: 'lead-won',
      verb: 'Lead marked as Converted',
      actor: userName(lead.updatedBy),
      at: lead.closedAt,
    });
  } else if (lead?.status === 'dropped' && lead.closedAt) {
    events.push({
      id: 'lead-dropped',
      verb: `Lead Dropped${lead.lostReason ? ` — ${lead.lostReason}` : ''}`,
      actor: userName(lead.updatedBy),
      at: lead.closedAt,
    });
  }

  return events
    .filter((e) => e.at)
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
};

export function LeadTimeline({ lead, history, comments }) {
  const events = buildEvents(lead, history, comments);

  if (events.length === 0) {
    return (
      <p className="text-xs text-slate-400">No activity yet.</p>
    );
  }

  return (
    <ol className="space-y-3">
      {events.map((event, idx) => (
        <li key={event.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
            {idx < events.length - 1 && (
              <span className="mt-1 w-px flex-1 bg-slate-200" aria-hidden="true" />
            )}
          </div>
          <div className="flex-1 pb-1">
            <p className="text-sm text-slate-800">{event.verb}</p>
            {event.detail && (
              <p className="mt-0.5 text-xs text-slate-700">{event.detail}</p>
            )}
            <p className="mt-0.5 text-[11px] text-slate-500">
              <span className="font-medium text-slate-600">{event.actor}</span>
              {' · '}
              {formatDateTime(event.at)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
