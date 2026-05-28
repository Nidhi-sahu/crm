import { PERMISSIONS } from '../modules/crm/auth/constants/permissions';

export const ICON_PATHS = {
  crm: 'M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z',
  dashboard: 'M4 13h6V4H4v9Zm10 7h6V11h-6v9ZM4 20h6v-5H4v5Zm10-13h6V4h-6v3Z',
  enquiries: 'M21 11.5a8.5 8.5 0 0 1-8.5 8.5H7l-4 3v-7.5A8.5 8.5 0 1 1 21 11.5Z',
  qualification: 'M5 12.5 10 17l9-10',
  leads: 'M3 7h18M3 12h12M3 17h7',
  assignment:
    'M7 9V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3M5 9h14v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9Z',
  followups:
    'M7 4v3M17 4v3M4 9h16M5 7h14a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z',
  reports: 'M4 19h16M6 16V9m4 7V5m4 11v-8m4 8v-4',
  users:
    'M3 20a7 7 0 0 1 14 0M10 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm9 8a5 5 0 0 0-3-4.5M15 4.5a4 4 0 0 1 0 7',
  configuration:
    'm12 3 1.5 3 3.3.5-2.4 2.3.6 3.2L12 10.6 9 12l.6-3.2-2.4-2.3 3.3-.5L12 3Zm0 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  audit: 'M9 4h6l4 4v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm0 0v4h6M9 13h6M9 17h4',
};

export const DASHBOARD_PATH = '/app/dashboard';

export const CRM_GROUP = {
  label: 'CRM',
  iconKey: 'crm',
  requires: PERMISSIONS.dashboard.view,
  children: [
    { label: 'Dashboard', path: DASHBOARD_PATH, iconKey: 'dashboard', requires: PERMISSIONS.dashboard.view },
    { label: 'Enquiries', path: '/app/enquiries', iconKey: 'enquiries', requires: PERMISSIONS.enquiry.read },
    { label: 'Leads', path: '/app/leads', iconKey: 'leads', requires: PERMISSIONS.lead.read },
    { label: 'Lead Assignment', path: '/app/lead-assignments', iconKey: 'assignment', requires: PERMISSIONS.lead.assign },
    { label: 'User Management', path: '/app/users', iconKey: 'users', requires: PERMISSIONS.user.read },
    { label: 'Roles', path: '/app/roles', iconKey: 'users', requires: PERMISSIONS.role.read },
    { label: 'Configuration', path: '/app/configurations', iconKey: 'configuration', requires: PERMISSIONS.configuration.read },
    { label: 'Reports', path: '/app/reports', iconKey: 'reports', requires: PERMISSIONS.report.view },
  ],
};
