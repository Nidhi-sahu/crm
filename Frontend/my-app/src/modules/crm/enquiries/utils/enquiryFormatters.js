const inrCompact = new Intl.NumberFormat('en-IN', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const inrFull = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export const formatBudgetRange = (min, max) => {
  const hasMin = Number(min) > 0;
  const hasMax = Number(max) > 0;
  if (!hasMin && !hasMax) return '—';
  if (hasMin && hasMax) return `₹${inrCompact.format(min)} – ₹${inrCompact.format(max)}`;
  if (hasMax) return `Up to ₹${inrCompact.format(max)}`;
  return `From ₹${inrCompact.format(min)}`;
};

export const formatINR = (value) =>
  Number.isFinite(Number(value)) ? inrFull.format(Number(value)) : '—';

export const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateTime = (value, time) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const datePart = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  if (time && /^\d{2}:\d{2}$/.test(time)) return `${datePart} · ${time}`;
  return datePart;
};

export const isOverdue = (value) => {
  if (!value) return false;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return false;
  return d.getTime() < Date.now();
};

export const formatRelative = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const diffMs = Date.now() - d.getTime();
  const sec = Math.round(diffMs / 1000);
  if (Math.abs(sec) < 60) return 'just now';
  const min = Math.round(sec / 60);
  if (Math.abs(min) < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (Math.abs(hr) < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (Math.abs(day) < 30) return `${day}d ago`;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const initialsOf = (name = '') =>
  name
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('') || '?';
