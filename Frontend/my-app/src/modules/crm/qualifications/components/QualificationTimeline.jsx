import { buildTimeline } from '../utils/timelineBuilder';

const formatWhen = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function QualificationTimeline({ enquiry, qualification }) {
  const events = buildTimeline({ enquiry, qualification });

  if (events.length === 0) {
    return (
      <p className="text-xs text-slate-400">
        No activity recorded yet — events will appear here after submit.
      </p>
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
            <p className="mt-0.5 text-[11px] text-slate-500">
              <span className="font-medium text-slate-600">{event.actor}</span>
              {' · '}
              {formatWhen(event.at)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
