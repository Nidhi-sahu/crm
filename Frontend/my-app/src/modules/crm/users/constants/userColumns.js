export const USER_COLUMNS = [
  { key: 'name', label: 'Name', hideable: false, sortable: true, sortKey: 'name' },
  { key: 'email', label: 'Email', hideable: true, sortable: false },
  { key: 'phone', label: 'Phone', hideable: true, sortable: false },
  { key: 'role', label: 'Role', hideable: true, sortable: false },
  { key: 'action', label: 'Action', hideable: false, sortable: false, align: 'right' },
];

export const DEFAULT_USER_COLUMN_ORDER = USER_COLUMNS.map((c) => c.key);

export const DEFAULT_PAGE_SIZE = 10;
export const USER_COLUMN_STORAGE_KEY = 'langdi.userColumns';
