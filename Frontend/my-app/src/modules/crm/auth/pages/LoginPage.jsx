import { AuthLayout } from '../../../../layouts/AuthLayout';
import { LoginForm } from '../components/LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Langdi CRM workspace"
    >
      <LoginForm />
    </AuthLayout>
  );
}
