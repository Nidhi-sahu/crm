import { statusLabel, statusTone } from '../constants/leadStatuses';

export function LeadStatusBadge({ status }) {
  const tone = statusTone(status);
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[13px] font-medium ${tone.bg} ${tone.text}`}
    >
      {statusLabel(status)}
    </span>
  );
}
