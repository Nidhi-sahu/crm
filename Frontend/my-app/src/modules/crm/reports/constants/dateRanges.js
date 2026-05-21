const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const endOfDay = (d) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};

export const DATE_PRESETS = [
  { value: 'mtd', label: 'Month to Date' },
  { value: 'lastWeek', label: 'Last Week' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'ytd', label: 'Year to Date' },
  { value: 'lastYear', label: 'Last Year' },
  { value: 'custom', label: 'Custom Range' },
];

// Returns { from, to } as ISO strings for a given preset.
export const resolvePreset = (preset, custom = {}) => {
  const now = new Date();
  let from;
  let to = endOfDay(now);

  switch (preset) {
    case 'mtd':
      from = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
      break;
    case 'lastWeek': {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      from = startOfDay(d);
      break;
    }
    case 'lastMonth': {
      from = startOfDay(new Date(now.getFullYear(), now.getMonth() - 1, 1));
      to = endOfDay(new Date(now.getFullYear(), now.getMonth(), 0));
      break;
    }
    case 'ytd':
      from = startOfDay(new Date(now.getFullYear(), 0, 1));
      break;
    case 'lastYear':
      from = startOfDay(new Date(now.getFullYear() - 1, 0, 1));
      to = endOfDay(new Date(now.getFullYear() - 1, 11, 31));
      break;
    case 'custom':
      from = custom.from ? startOfDay(new Date(custom.from)) : null;
      to = custom.to ? endOfDay(new Date(custom.to)) : endOfDay(now);
      break;
    default:
      from = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
  }

  return {
    from: from ? from.toISOString() : null,
    to: to ? to.toISOString() : null,
  };
};

export const REPORT_TYPES = [
  { value: 'organization', label: 'Organization' },
  { value: 'salesPerson', label: 'Sales Person' },
  { value: 'teamComparison', label: 'Team Comparison' },
];

export const formatRangeLabel = (from, to) => {
  if (!from && !to) return 'All time';
  const fmt = (v) =>
    v
      ? new Date(v).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : '—';
  return `${fmt(from)} → ${fmt(to)}`;
};
