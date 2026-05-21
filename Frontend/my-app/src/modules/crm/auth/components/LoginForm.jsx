import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Input } from '../../../../shared/components/Input';
import { PasswordInput } from '../../../../shared/components/PasswordInput';
import { Button } from '../../../../shared/components/Button';
import { Alert } from '../../../../shared/components/Alert';
import { useAuth } from '../hooks/useAuth';
import { resolveRoleLanding } from '../utils/roleRedirect';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, dismissError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onTouched',
    defaultValues: { email: '', password: '', rememberMe: true },
  });

  useEffect(() => () => dismissError(), [dismissError]);

  const onSubmit = async (values) => {
    try {
      const result = await login(values);
      const dest =
        location.state?.from?.pathname || resolveRoleLanding(result.user);
      navigate(dest, { replace: true });
    } catch (_) {
      // error already in redux state
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {error?.message && (
        <Alert tone="error" title="Sign-in failed">
          {error.message}
        </Alert>
      )}

      <Input
        label="Email address"
        type="email"
        placeholder="you@company.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email', {
          required: 'Email is required',
          pattern: { value: EMAIL_RE, message: 'Enter a valid email address' },
        })}
      />

      <PasswordInput
        label="Password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register('password', {
          required: 'Password is required',
          minLength: { value: 8, message: 'Password must be at least 8 characters' },
        })}
      />

      <Button
        type="submit"
        variant="primary"
        loading={isLoading || isSubmitting}
        className="w-full mt-2"
      >
        {isLoading || isSubmitting ? 'Signing in…' : 'Sign in'}
      </Button>

      <p className="pt-2 text-center text-xs text-slate-500">
        Contact your administrator if you don&apos;t have access.
      </p>
    </form>
  );
}
