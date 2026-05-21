export const TEMPERATURES = {
  HOT: 'hot',
  WARM: 'warm',
  COLD: 'cold',
};

export const TEMPERATURE_OPTIONS = [
  { value: TEMPERATURES.HOT, label: 'Hot' },
  { value: TEMPERATURES.WARM, label: 'Warm' },
  { value: TEMPERATURES.COLD, label: 'Cold' },
];

const TONE = {
  [TEMPERATURES.HOT]: { bg: 'bg-rose-50', text: 'text-rose-600', dot: 'bg-rose-500' },
  [TEMPERATURES.WARM]: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
  [TEMPERATURES.COLD]: { bg: 'bg-brand-100', text: 'text-brand-600', dot: 'bg-brand-500' },
};

export const temperatureTone = (value) => TONE[value] || TONE[TEMPERATURES.COLD];
export const temperatureLabel = (value) =>
  TEMPERATURE_OPTIONS.find((t) => t.value === value)?.label || '—';
