export const LEAD_COLUMNS = [
  { key: 'enquiryId', label: 'Enquiry ID', hideable: true, default: true },
  { key: 'assignedTo', label: 'Assigned To', hideable: true, default: true },
  { key: 'clientName', label: 'Client Name', hideable: true, default: true },
  { key: 'companyName', label: 'Company', hideable: true, default: true },
  { key: 'clientPhone', label: 'Phone', hideable: true, default: true },
  { key: 'clientEmail', label: 'Email', hideable: true, default: false },
  { key: 'currentStage', label: 'Current Stage', hideable: true, default: true },
  { key: 'nextStage', label: 'Next Stage', hideable: true, default: false },
  { key: 'plannedDate', label: 'Planned Date', hideable: true, default: true },
  { key: 'actualDate', label: 'Actual Date', hideable: true, default: false },
  { key: 'actualValue', label: 'Actual Value', hideable: true, default: true },
  { key: 'status', label: 'Lead Status', hideable: true, default: true },
  { key: 'action', label: 'Action', hideable: false, default: true, align: 'right' },
];

export const DEFAULT_PAGE_SIZE = 10;
export const COLUMN_STORAGE_KEY = 'langdi.leadsColumns';
