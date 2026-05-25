export const CATEGORIES = [
  {
    key: 'core',
    label: 'Core',
    modules: ['dashboard'],
  },
  {
    key: 'crm',
    label: 'CRM',
    modules: [
      'enquiry',
      'qualification',
      'lead',
      'leadAssignment',
      'leadStage',
      'comment',
      'reminder',
    ],
  },
  {
    key: 'admin',
    label: 'Administration',
    modules: ['user', 'role', 'permission', 'configuration'],
  },
  {
    key: 'insights',
    label: 'Reports & Notifications',
    modules: ['report', 'notification'],
  },
];

export const MODULE_LABEL = {
  dashboard: 'Dashboard',
  enquiry: 'Enquiries',
  qualification: 'Qualifications',
  lead: 'Leads',
  leadAssignment: 'Lead Assignments',
  leadStage: 'Lead Stages',
  comment: 'Comments',
  reminder: 'Reminders',
  user: 'Users',
  role: 'Roles',
  permission: 'Permissions',
  configuration: 'Configuration',
  auditLog: 'Audit Logs',
  report: 'Reports',
  notification: 'Notifications',
};

export const ACTION_LABEL = {
  create: 'Create',
  read: 'Read',
  update: 'Update',
  delete: 'Delete',
  assign: 'Assign',
  assignRole: 'Assign Role',
  moveStage: 'Move Stage',
  complete: 'Complete',
  view: 'View',
  export: 'Export',
};

export const ACTION_ORDER = [
  'view',
  'read',
  'create',
  'update',
  'delete',
  'assign',
  'assignRole',
  'moveStage',
  'complete',
  'export',
];
