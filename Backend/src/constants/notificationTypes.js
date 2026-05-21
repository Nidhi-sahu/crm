const NOTIFICATION_TYPE = {
  LEAD_ASSIGNED: 'lead_assigned',
  LEAD_REASSIGNED: 'lead_reassigned',
  LEAD_AUTO_ASSIGNED: 'lead_auto_assigned',
  LEAD_STAGE_MOVED: 'lead_stage_moved',
  REMINDER_DUE: 'reminder_due',
  REMINDER_OVERDUE: 'reminder_overdue',
  COMMENT_ADDED: 'comment_added',
  SYSTEM: 'system',
};

const NOTIFICATION_TYPE_VALUES = Object.values(NOTIFICATION_TYPE);

module.exports = { NOTIFICATION_TYPE, NOTIFICATION_TYPE_VALUES };
