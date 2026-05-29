// Options shown in the "Source of Lead" dropdown (Add Enquiry form).
export const ENQUIRY_SOURCES = [
  { value: 'broker', label: 'Broker' },
  { value: 'self', label: 'Self' },
  { value: 'metaAds', label: 'Meta Ads' },
  { value: 'reference', label: 'Reference' },
  { value: 'walkIn', label: 'Walk-in' },
];

// Full label map — covers older/bulk-import source values too (for display).
const ALL_SOURCE_LABELS = {
  broker: 'Broker',
  self: 'Self',
  metaAds: 'Meta Ads',
  reference: 'Reference',
  walkIn: 'Walk-in',
  website: 'Website',
  facebook: 'Facebook',
  instagram: 'Instagram',
  googleAds: 'Google Ads',
  housing: 'Housing',
  personalClient: 'Personal Client',
  other: 'Other',
};

export const SOURCE_LABEL = ALL_SOURCE_LABELS;

export const labelForSource = (value) => ALL_SOURCE_LABELS[value] || value || '—';
