export const LEAD_STATUS = {
  ACTIVE: 'active',
  WON: 'won',
  LOST: 'lost',
  DROPPED: 'dropped',
};

export const UI_STATUS = {
  OPEN: 'open',
  CONVERTED: 'converted',
  DROPPED: 'dropped',
  TODAYS_FOLLOWUP: 'todaysFollowup',
};

export const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: UI_STATUS.OPEN, label: 'Open' },
  { value: UI_STATUS.CONVERTED, label: 'Converted' },
  { value: UI_STATUS.DROPPED, label: 'Dropped' },
  { value: UI_STATUS.TODAYS_FOLLOWUP, label: "Today's Follow-up" },
];

export const uiStatusToBackend = (ui) => {
  switch (ui) {
    case UI_STATUS.OPEN:
      return [LEAD_STATUS.ACTIVE];
    case UI_STATUS.CONVERTED:
      return [LEAD_STATUS.WON];
    case UI_STATUS.DROPPED:
      return [LEAD_STATUS.LOST, LEAD_STATUS.DROPPED];
    default:
      return null;
  }
};

export const backendToUi = (status) => {
  if (status === LEAD_STATUS.ACTIVE) return UI_STATUS.OPEN;
  if (status === LEAD_STATUS.WON) return UI_STATUS.CONVERTED;
  if (status === LEAD_STATUS.LOST || status === LEAD_STATUS.DROPPED) return UI_STATUS.DROPPED;
  return UI_STATUS.OPEN;
};

export const statusLabel = (status) => {
  const ui = backendToUi(status);
  switch (ui) {
    case UI_STATUS.OPEN:
      return 'Open';
    case UI_STATUS.CONVERTED:
      return 'Converted';
    case UI_STATUS.DROPPED:
      return 'Dropped';
    default:
      return '—';
  }
};

export const statusTone = (status) => {
  const ui = backendToUi(status);
  switch (ui) {
    case UI_STATUS.OPEN:
      return { bg: 'bg-brand-100', text: 'text-brand-700' };
    case UI_STATUS.CONVERTED:
      return { bg: 'bg-emerald-50', text: 'text-emerald-700' };
    case UI_STATUS.DROPPED:
      return { bg: 'bg-rose-50', text: 'text-rose-700' };
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-700' };
  }
};
