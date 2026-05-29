export const ENQUIRY_STATUS = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUALIFIED: 'qualified',
  REJECTED: 'rejected',
  HOLD: 'hold',
  CONVERTED: 'converted',
};

// 3-bucket UI status
export const UI_STATUS = {
  PENDING: 'pending',
  QUALIFIED: 'qualified',
  NOT_QUALIFIED: 'notQualified',
  TODAYS_FOLLOWUP: 'todaysFollowup',
};

export const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: UI_STATUS.PENDING, label: 'Pending' },
  { value: UI_STATUS.QUALIFIED, label: 'Qualified' },
  { value: UI_STATUS.NOT_QUALIFIED, label: 'Not Qualified' },
  { value: UI_STATUS.TODAYS_FOLLOWUP, label: "Today's Follow-up" },
];

// Map a UI status bucket → backend status array (sent to API as repeated query params)
export const uiStatusToBackend = (uiStatus) => {
  switch (uiStatus) {
    case UI_STATUS.PENDING:
      return [ENQUIRY_STATUS.NEW, ENQUIRY_STATUS.CONTACTED, ENQUIRY_STATUS.HOLD];
    case UI_STATUS.QUALIFIED:
      return [ENQUIRY_STATUS.QUALIFIED, ENQUIRY_STATUS.CONVERTED];
    case UI_STATUS.NOT_QUALIFIED:
      return [ENQUIRY_STATUS.REJECTED];
    default:
      return null;
  }
};

// Map backend status → UI bucket
export const backendToUiStatus = (status) => {
  if (
    status === ENQUIRY_STATUS.NEW ||
    status === ENQUIRY_STATUS.CONTACTED ||
    status === ENQUIRY_STATUS.HOLD
  ) {
    return UI_STATUS.PENDING;
  }
  if (status === ENQUIRY_STATUS.QUALIFIED || status === ENQUIRY_STATUS.CONVERTED) {
    return UI_STATUS.QUALIFIED;
  }
  if (status === ENQUIRY_STATUS.REJECTED) return UI_STATUS.NOT_QUALIFIED;
  return UI_STATUS.PENDING;
};

const UI_LABEL = {
  [UI_STATUS.PENDING]: 'Pending',
  [UI_STATUS.QUALIFIED]: 'Qualified',
  [UI_STATUS.NOT_QUALIFIED]: 'Not Qualified',
};

const UI_TONE = {
  [UI_STATUS.PENDING]: 'amber',
  [UI_STATUS.QUALIFIED]: 'emerald',
  [UI_STATUS.NOT_QUALIFIED]: 'rose',
};

export const uiStatusLabel = (uiStatus) => UI_LABEL[uiStatus] || '—';
export const uiStatusTone = (uiStatus) => UI_TONE[uiStatus] || 'slate';

// Old API kept for any consumers still using these names
export const qualificationLabel = (status) => uiStatusLabel(backendToUiStatus(status));
export const qualificationTone = (status) => uiStatusTone(backendToUiStatus(status));

export const ENQUIRY_STATUS_OPTIONS = [
  { value: ENQUIRY_STATUS.NEW, label: 'New' },
  { value: ENQUIRY_STATUS.CONTACTED, label: 'Contacted' },
  { value: ENQUIRY_STATUS.QUALIFIED, label: 'Qualified' },
  { value: ENQUIRY_STATUS.HOLD, label: 'Hold' },
  { value: ENQUIRY_STATUS.REJECTED, label: 'Rejected' },
  { value: ENQUIRY_STATUS.CONVERTED, label: 'Converted' },
];
