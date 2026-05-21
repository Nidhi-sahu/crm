export const ROLE_NAMES = {
  ADMINISTRATOR: 'Administrator',
  SALES_COORDINATOR: 'Sales Coordinator',
  SALES_PERSON: 'Sales Person',
  LEAD_GENERATOR: 'Lead Generator',
};

const ROLE_TONE = {
  [ROLE_NAMES.ADMINISTRATOR]: 'bg-rose-50 text-rose-700',
  [ROLE_NAMES.SALES_COORDINATOR]: 'bg-amber-50 text-amber-700',
  [ROLE_NAMES.SALES_PERSON]: 'bg-brand-100 text-brand-700',
  [ROLE_NAMES.LEAD_GENERATOR]: 'bg-emerald-50 text-emerald-700',
};

export const roleTone = (name) => ROLE_TONE[name] || 'bg-slate-100 text-slate-700';
