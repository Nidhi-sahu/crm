export const ENQUIRY_COLUMNS = [
  { key: 'date', label: 'Date', sortable: true, sortKey: 'dateOfEnquiry' },
  { key: 'clientName', label: 'Client Name', sortable: true, sortKey: 'clientName' },
  { key: 'companyName', label: 'Company Name', sortable: false },
  { key: 'clientPhone', label: 'Phone Number', sortable: false },
  { key: 'clientEmail', label: 'Email', sortable: false },
  { key: 'status', label: 'Status', sortable: false },
  { key: 'createdBy', label: 'Created By', sortable: false },
  { key: 'followup', label: 'Followup Date', sortable: true, sortKey: 'nextFollowupAt' },
  { key: 'remarks', label: 'Remark', sortable: false },
  { key: 'timestamp', label: 'Timestamp', sortable: false },
  { key: 'actions', label: 'Action', sortable: false, align: 'right' },
];

export const DEFAULT_PAGE_SIZE = 10;
