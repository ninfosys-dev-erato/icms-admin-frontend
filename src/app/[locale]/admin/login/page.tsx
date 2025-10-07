import { LoginForm } from '@/domains/auth/components/login-form';
import { LoginLayout } from '@/components/layout/login-layout';

export default function LoginPage() {
  return (
    <LoginLayout>
      <LoginForm />
    </LoginLayout>
  );
} 