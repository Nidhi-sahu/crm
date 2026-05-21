const inrCompact = new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 });
const inrFull = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export const formatINR = (n) =>
  Number.isFinite(Number(n)) && Number(n) > 0 ? inrFull.format(Number(n)) : '—';

export const formatINRCompact = (n) =>
  Number.isFinite(Number(n)) && Number(n) > 0 ? `₹${inrCompact.format(Number(n))}` : '—';

export const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const initialsOf = (name = '') =>
  name
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('') || '?';

export const shortCode = (id, prefix) => {
  if (!id) return '—';
  return `${prefix}-${String(id).slice(-6).toUpperCase()}`;
};
