import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '../modules/crm/auth/pages/LoginPage';
import ForgotPasswordPage from '../modules/crm/auth/pages/ForgotPasswordPage';
import DashboardPage from '../modules/crm/dashboard/pages/DashboardPage';
import DashboardPlaceholder from '../modules/crm/dashboard/pages/DashboardPlaceholder';
import EnquiryListPage from '../modules/crm/enquiries/pages/EnquiryListPage';
import LeadAssignmentPage from '../modules/crm/lead-assignments/pages/LeadAssignmentPage';
import LeadsPage from '../modules/crm/leads/pages/LeadsPage';
import UserManagementPage from '../modules/crm/users/pages/UserManagementPage';
import ConfigurationPage from '../modules/crm/configuration/pages/ConfigurationPage';
import ReportsPage from '../modules/crm/reports/pages/ReportsPage';
import { AppLayout } from '../layouts/AppLayout';
import { ProtectedRoute } from '../shared/guards/ProtectedRoute';
import { PublicRoute } from '../shared/guards/PublicRoute';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },

  {
    element: <PublicRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
    ],
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/app',
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/app/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'enquiries', element: <EnquiryListPage /> },
          { path: 'enquiries/:id', element: <DashboardPlaceholder title="Enquiry Details (Phase 3)" /> },
          { path: 'qualifications', element: <DashboardPlaceholder title="Qualification" /> },
          { path: 'leads', element: <LeadsPage /> },
          { path: 'lead-assignments', element: <LeadAssignmentPage /> },
          { path: 'followups', element: <DashboardPlaceholder title="Followups" /> },
          { path: 'reminders', element: <Navigate to="/app/followups" replace /> },
          { path: 'reports', element: <ReportsPage /> },
          { path: 'users', element: <UserManagementPage /> },
          { path: 'roles', element: <DashboardPlaceholder title="Roles" /> },
          { path: 'configurations', element: <ConfigurationPage /> },
          { path: 'audit-logs', element: <DashboardPlaceholder title="Audit Logs" /> },
        ],
      },
    ],
  },

  { path: '*', element: <Navigate to="/login" replace /> },
]);
