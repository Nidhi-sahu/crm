export const ENQUIRY_SOURCES = [
  { value: 'website', label: 'Website' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'reference', label: 'Reference' },
  { value: 'walkIn', label: 'Walk-in' },
  { value: 'googleAds', label: 'Google Ads' },
  { value: 'metaAds', label: 'Meta Ads' },
  { value: 'personalClient', label: 'Personal Client' },
  { value: 'other', label: 'Other' },
];

export const SOURCE_LABEL = Object.fromEntries(
  ENQUIRY_SOURCES.map((s) => [s.value, s.label]),
);

export const labelForSource = (value) => SOURCE_LABEL[value] || value || '—';
