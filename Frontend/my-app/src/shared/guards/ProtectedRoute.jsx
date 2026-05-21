import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe } from '../../modules/crm/auth/redux/authSlice';
import { Spinner } from '../components/Spinner';

export function ProtectedRoute() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user, token, status, bootstrapped } = useSelector((s) => s.auth);

  useEffect(() => {
    if (token && !user && status !== 'loading') {
      dispatch(fetchMe());
    }
  }, [dispatch, token, user, status]);

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!user && !bootstrapped) {
    return (
      <div className="flex h-full min-h-screen items-center justify-center bg-white">
        <Spinner size={28} className="text-slate-400" />
      </div>
    );
  }

  if (!user && bootstrapped) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
