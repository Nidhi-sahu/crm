import { ROLES } from '../constants/roles';

const ROLE_LANDING = {
  [ROLES.ADMIN]: '/app/dashboard',
  [ROLES.SALES_COORDINATOR]: '/app/leads',
  [ROLES.SALES_PERSON]: '/app/leads',
  [ROLES.LEAD_GENERATOR]: '/app/enquiries',
};

export const resolveRoleLanding = (user) => {
  if (!user) return '/login';
  const roleName = user.role?.name || user.roleName;
  return ROLE_LANDING[roleName] || '/app/dashboard';
};
