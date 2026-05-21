export const LEAD_COLUMNS = [
  { key: 'enquiryId', label: 'Enquiry ID' },
  { key: 'clientName', label: 'Client Name' },
  { key: 'companyName', label: 'Company' },
  { key: 'clientPhone', label: 'Phone' },
  { key: 'clientEmail', label: 'Email' },
  { key: 'requirement', label: 'Requirement' },
  { key: 'stage', label: 'Stage' },
  { key: 'action', label: 'Action', align: 'right' },
];

export const DISTRIBUTION_COLUMNS = [
  { key: 'name', label: 'Sales Person', hideable: false },
  { key: 'total', label: 'Total Leads', hideable: false },
];

export const DEFAULT_PAGE_SIZE = 10;
export const SALES_PERSON_ROLE_NAME = 'Sales Person';
export const DISTRIBUTION_COLS_STORAGE_KEY = 'langdi.distributionCols';
