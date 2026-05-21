import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { resolveRoleLanding } from '../../modules/crm/auth/utils/roleRedirect';

export function PublicRoute() {
  const { user, token } = useSelector((s) => s.auth);
  if (token && user) {
    return <Navigate to={resolveRoleLanding(user)} replace />;
  }
  return <Outlet />;
}
