export const ENQUIRY_COLUMNS = [
  { key: 'date', label: 'Date', sortable: true, sortKey: 'dateOfEnquiry', hideable: true },
  { key: 'clientName', label: 'Client Name', sortable: true, sortKey: 'clientName', hideable: true },
  { key: 'companyName', label: 'Company Name', sortable: false, hideable: true },
  { key: 'clientPhone', label: 'Phone Number', sortable: false, hideable: true },
  { key: 'clientEmail', label: 'Email', sortable: false, hideable: true },
  { key: 'status', label: 'Status', sortable: false, hideable: true },
  { key: 'createdBy', label: 'Created By', sortable: false, hideable: true },
  { key: 'followup', label: 'Followup Date', sortable: true, sortKey: 'nextFollowupAt', hideable: true },
  { key: 'remarks', label: 'Remark', sortable: false, hideable: true },
  { key: 'timestamp', label: 'Timestamp', sortable: false, hideable: true },
  { key: 'actions', label: 'Action', sortable: false, align: 'right', hideable: false },
];

export const DEFAULT_PAGE_SIZE = 10;
export const ENQUIRY_COLUMN_STORAGE_KEY = 'langdi.enquiryColumns.v3';
