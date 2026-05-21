import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../modules/crm/auth/redux/authSlice';
import dashboardReducer from '../modules/crm/dashboard/redux/dashboardSlice';
import enquiriesReducer from '../modules/crm/enquiries/redux/enquirySlice';
import qualificationsReducer from '../modules/crm/qualifications/redux/qualificationSlice';
import leadAssignmentsReducer from '../modules/crm/lead-assignments/redux/leadAssignmentSlice';
import leadsReducer from '../modules/crm/leads/redux/leadsSlice';
import usersReducer from '../modules/crm/users/redux/usersSlice';
import configurationReducer from '../modules/crm/configuration/redux/configurationSlice';
import reportsReducer from '../modules/crm/reports/redux/reportSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    enquiries: enquiriesReducer,
    qualifications: qualificationsReducer,
    leadAssignments: leadAssignmentsReducer,
    leads: leadsReducer,
    users: usersReducer,
    configuration: configurationReducer,
    reports: reportsReducer,
  },
  devTools: import.meta.env.MODE !== 'production',
});
