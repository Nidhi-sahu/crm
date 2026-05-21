const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

const ENQUIRY_STATUS = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUALIFIED: 'qualified',
  REJECTED: 'rejected',
  HOLD: 'hold',
  CONVERTED: 'converted',
};

const ENQUIRY_STATUS_VALUES = Object.values(ENQUIRY_STATUS);

const QUALIFICATION_STATUS = {
  PENDING: 'pending',
  QUALIFIED: 'qualified',
  REJECTED: 'rejected',
  HOLD: 'hold',
  FUTURE_PROSPECT: 'futureProspect',
};

const QUALIFICATION_STATUS_VALUES = Object.values(QUALIFICATION_STATUS);

const LEAD_STATUS = {
  ACTIVE: 'active',
  WON: 'won',
  LOST: 'lost',
  DROPPED: 'dropped',
};

const LEAD_STATUS_VALUES = Object.values(LEAD_STATUS);

const LEAD_TERMINAL_STATUSES = [LEAD_STATUS.WON, LEAD_STATUS.LOST, LEAD_STATUS.DROPPED];

const REMINDER_STATUS = {
  PENDING: 'pending',
  DONE: 'done',
  MISSED: 'missed',
  CANCELLED: 'cancelled',
};

const REMINDER_STATUS_VALUES = Object.values(REMINDER_STATUS);

module.exports = {
  USER_STATUS,
  ENQUIRY_STATUS,
  ENQUIRY_STATUS_VALUES,
  QUALIFICATION_STATUS,
  QUALIFICATION_STATUS_VALUES,
  LEAD_STATUS,
  LEAD_STATUS_VALUES,
  LEAD_TERMINAL_STATUSES,
  REMINDER_STATUS,
  REMINDER_STATUS_VALUES,
};
