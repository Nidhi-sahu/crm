import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { login, googleLogin, logout, fetchMe, clearError } from '../redux/authSlice';
import { hasPermission, hasAnyPermission } from '../../../../shared/utils/permissions';

export function useAuth() {
  const dispatch = useDispatch();
  const auth = useSelector((s) => s.auth);

  const doLogin = useCallback(
    (credentials) => dispatch(login(credentials)).unwrap(),
    [dispatch],
  );
  const doGoogleLogin = useCallback(
    (credential) => dispatch(googleLogin(credential)).unwrap(),
    [dispatch],
  );
  const doLogout = useCallback(() => dispatch(logout()), [dispatch]);
  const refresh = useCallback(() => dispatch(fetchMe()).unwrap(), [dispatch]);
  const dismissError = useCallback(() => dispatch(clearError()), [dispatch]);

  return {
    user: auth.user,
    token: auth.token,
    status: auth.status,
    error: auth.error,
    isAuthenticated: !!(auth.token && auth.user),
    isLoading: auth.status === 'loading',
    can: (key) => hasPermission(auth.user, key),
    canAny: (keys) => hasAnyPermission(auth.user, keys),
    login: doLogin,
    loginWithGoogle: doGoogleLogin,
    logout: doLogout,
    refresh,
    dismissError,
  };
}
