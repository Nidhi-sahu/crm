const compactNumber = new Intl.NumberFormat('en-IN', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const plainNumber = new Intl.NumberFormat('en-IN');

const inrCurrency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export const formatNumber = (n) =>
  Number.isFinite(Number(n)) ? plainNumber.format(Number(n)) : '—';

export const formatCompact = (n) =>
  Number.isFinite(Number(n)) ? compactNumber.format(Number(n)) : '—';

export const formatPercent = (n, digits = 1) => {
  if (!Number.isFinite(Number(n))) return '—';
  return `${Number(n).toFixed(digits)}%`;
};

export const formatCurrencyINR = (n) =>
  Number.isFinite(Number(n)) ? inrCurrency.format(Number(n)) : '—';
