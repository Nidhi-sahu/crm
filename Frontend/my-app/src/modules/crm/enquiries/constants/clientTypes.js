export const CLIENT_TYPES = [
  { value: 'individual', label: 'Individual' },
  { value: 'company', label: 'Company' },
  { value: 'government', label: 'Government' },
  { value: 'ngo', label: 'NGO' },
  { value: 'other', label: 'Other' },
];

export const labelForClientType = (value) =>
  CLIENT_TYPES.find((c) => c.value === value)?.label || '—';
