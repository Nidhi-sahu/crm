const MODULES = {
  DASHBOARD: 'dashboard',
  USER: 'user',
  ROLE: 'role',
  PERMISSION: 'permission',
  ENQUIRY: 'enquiry',
  QUALIFICATION: 'qualification',
  LEAD: 'lead',
  LEAD_ASSIGNMENT: 'leadAssignment',
  LEAD_STAGE: 'leadStage',
  COMMENT: 'comment',
  REMINDER: 'reminder',
  REPORT: 'report',
  NOTIFICATION: 'notification',
  CONFIGURATION: 'configuration',
  AUDIT_LOG: 'auditLog',
};

const ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  ASSIGN: 'assign',
  ASSIGN_ROLE: 'assignRole',
  MOVE_STAGE: 'moveStage',
  COMPLETE: 'complete',
  VIEW: 'view',
  EXPORT: 'export',
};

const k = (m, a) => `${m}:${a}`;

const entry = (m, a, description) => ({ key: k(m, a), module: m, action: a, description });

const PERMISSION_CATALOG = [
  entry(MODULES.DASHBOARD, ACTIONS.VIEW, 'View dashboard'),
  entry(MODULES.DASHBOARD, ACTIONS.EXPORT, 'Export dashboard'),

  entry(MODULES.USER, ACTIONS.CREATE, 'Create user'),
  entry(MODULES.USER, ACTIONS.READ, 'Read users'),
  entry(MODULES.USER, ACTIONS.UPDATE, 'Update user'),
  entry(MODULES.USER, ACTIONS.DELETE, 'Delete user'),
  entry(MODULES.USER, ACTIONS.ASSIGN_ROLE, 'Assign role to user'),

  entry(MODULES.ROLE, ACTIONS.CREATE, 'Create role'),
  entry(MODULES.ROLE, ACTIONS.READ, 'Read roles'),
  entry(MODULES.ROLE, ACTIONS.UPDATE, 'Update role'),
  entry(MODULES.ROLE, ACTIONS.DELETE, 'Delete role'),

  entry(MODULES.PERMISSION, ACTIONS.READ, 'Read permissions catalog'),

  entry(MODULES.ENQUIRY, ACTIONS.CREATE, 'Create enquiry'),
  entry(MODULES.ENQUIRY, ACTIONS.READ, 'Read enquiries'),
  entry(MODULES.ENQUIRY, ACTIONS.UPDATE, 'Update enquiry'),
  entry(MODULES.ENQUIRY, ACTIONS.DELETE, 'Delete enquiry'),

  entry(MODULES.QUALIFICATION, ACTIONS.CREATE, 'Create qualification'),
  entry(MODULES.QUALIFICATION, ACTIONS.READ, 'Read qualifications'),
  entry(MODULES.QUALIFICATION, ACTIONS.UPDATE, 'Update qualification'),

  entry(MODULES.LEAD, ACTIONS.CREATE, 'Create lead'),
  entry(MODULES.LEAD, ACTIONS.READ, 'Read leads'),
  entry(MODULES.LEAD, ACTIONS.UPDATE, 'Update lead'),
  entry(MODULES.LEAD, ACTIONS.DELETE, 'Delete lead'),
  entry(MODULES.LEAD, ACTIONS.ASSIGN, 'Assign lead'),
  entry(MODULES.LEAD, ACTIONS.MOVE_STAGE, 'Move lead stage'),

  entry(MODULES.LEAD_STAGE, ACTIONS.CREATE, 'Create lead stage'),
  entry(MODULES.LEAD_STAGE, ACTIONS.READ, 'Read lead stages'),
  entry(MODULES.LEAD_STAGE, ACTIONS.UPDATE, 'Update lead stage'),
  entry(MODULES.LEAD_STAGE, ACTIONS.DELETE, 'Delete lead stage'),

  entry(MODULES.COMMENT, ACTIONS.CREATE, 'Create comment'),
  entry(MODULES.COMMENT, ACTIONS.READ, 'Read comments'),

  entry(MODULES.REMINDER, ACTIONS.CREATE, 'Create reminder'),
  entry(MODULES.REMINDER, ACTIONS.READ, 'Read reminders'),
  entry(MODULES.REMINDER, ACTIONS.UPDATE, 'Update reminder'),
  entry(MODULES.REMINDER, ACTIONS.COMPLETE, 'Complete reminder'),

  entry(MODULES.REPORT, ACTIONS.VIEW, 'View reports'),
  entry(MODULES.REPORT, ACTIONS.EXPORT, 'Export reports'),

  entry(MODULES.NOTIFICATION, ACTIONS.READ, 'Read notifications'),
  entry(MODULES.NOTIFICATION, ACTIONS.UPDATE, 'Update notifications'),

  entry(MODULES.CONFIGURATION, ACTIONS.READ, 'Read configurations'),
  entry(MODULES.CONFIGURATION, ACTIONS.UPDATE, 'Update configurations'),

  entry(MODULES.AUDIT_LOG, ACTIONS.READ, 'Read audit logs'),
];

module.exports = { MODULES, ACTIONS, PERMISSION_CATALOG };
