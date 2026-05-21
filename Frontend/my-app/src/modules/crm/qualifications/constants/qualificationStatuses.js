export const QUALIFICATION_STATUS = {
  QUALIFIED: 'qualified',
  NOT_QUALIFIED: 'rejected',
  HOLD: 'hold',
  FUTURE_PROSPECT: 'futureProspect',
};

export const STATUS_OPTIONS = [
  {
    value: QUALIFICATION_STATUS.QUALIFIED,
    label: 'Qualified',
    description: 'Lead is ready to move forward',
    tone: 'emerald',
  },
  {
    value: QUALIFICATION_STATUS.NOT_QUALIFIED,
    label: 'Not Qualified',
    description: 'Lead does not match criteria',
    tone: 'rose',
  },
  {
    value: QUALIFICATION_STATUS.HOLD,
    label: 'Hold',
    description: 'Pause for now, revisit soon',
    tone: 'amber',
  },
  {
    value: QUALIFICATION_STATUS.FUTURE_PROSPECT,
    label: 'Future Prospect',
    description: 'Not ready now, follow up later',
    tone: 'brand',
  },
];

export const TEMPERATURES = {
  HOT: 'hot',
  WARM: 'warm',
  COLD: 'cold',
};

export const TEMPERATURE_OPTIONS = [
  {
    value: TEMPERATURES.HOT,
    label: 'Hot Lead',
    description: 'High intent · acts soon',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    selectedRing: 'ring-rose-400',
  },
  {
    value: TEMPERATURES.WARM,
    label: 'Warm Lead',
    description: 'Interested · needs nurture',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    selectedRing: 'ring-amber-400',
  },
  {
    value: TEMPERATURES.COLD,
    label: 'Cold Lead',
    description: 'Low intent · long-term',
    bg: 'bg-brand-100',
    text: 'text-brand-700',
    selectedRing: 'ring-brand-400',
  },
];
