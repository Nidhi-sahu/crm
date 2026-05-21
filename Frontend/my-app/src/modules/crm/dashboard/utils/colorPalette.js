export const CHART_COLORS = [
  '#1278E6',
  '#5FB2FF',
  '#8FCBFF',
  '#BEE1FF',
  '#0A5BB0',
  '#2F98FF',
  '#94A3B8',
  '#475569',
];

export const colorAt = (index) => CHART_COLORS[index % CHART_COLORS.length];
