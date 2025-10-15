
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, InlineNotification } from '@carbon/react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/routing';
import { useLogin } from '@/hooks/queries/use-auth-queries';
import { LoginCredentials } from '@/types/auth';
import { EnglishOnlyText } from '@/shared/components/english-only-text';
import '@/domains/auth/styles/auth.css';

import { LoginFormHeader } from './login-form-header';
import { LoginFormFields } from './login-form-fields';
import { LoginFormButton } from './login-form-button';
import { LoginPageFooter } from './login-page-footer';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});
type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const t = useTranslations('auth');
  const router = useRouter();
  const loginMutation = useLogin();
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setShowError(false);
      setErrorMessage('');
      const credentials: LoginCredentials = {
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      };
      await loginMutation.mutateAsync(credentials);
      // try { await router.push('/admin/dashboard'); }
      // catch { window.location.href = '/admin/dashboard'; }
      try { await router.push('/admin/content-management'); }
      catch { window.location.href = '/admin/content-management'; }
    } catch (error: any) {
      setShowError(true);
      let message = t('errors.serverError');
      if (error?.response) {
        if (error.response.status === 404) message = 'API endpoint not found. Please check if the mock server is running.';
        else if (error.response.status === 401) message = t('errors.invalidCredentials');
        else if (error.response.status === 429) message = t('errors.rateLimited');
        else if (error.response.data?.error?.message) message = error.response.data.error.message;
      } else if (typeof error?.message === 'string') {
        const m = error.message.toLowerCase();
        if (m.includes('rate')) message = t('errors.rateLimited');
        else if (m.includes('invalid') || m.includes('unauthorized')) message = t('errors.invalidCredentials');
        else if (m.includes('network')) message = t('errors.networkError');
        else message = error.message;
      } else if (error?.error?.message) {
        message = error.error.message;
      }
      setErrorMessage(message);
      setError('root', { type: 'manual', message });
    }
  };

  return (
    <div className="login-page">
      {/* unified white canvas */}
      <div className="login-canvas">
        <div className="login-form-container">
          <Form onSubmit={handleSubmit(onSubmit)}>
            <LoginFormHeader
              title={t('title')}
              subtitle={t('subtitle')}
            />

            {showError && (errors.root || errorMessage) && (
              <InlineNotification
                kind="error"
                title="Login Failed"
                subtitle={errors.root?.message || errorMessage}
                hideCloseButton
                lowContrast
                className="login-form-error"
              />
            )}

            <LoginFormFields
              t={t}
              register={register}
              errors={errors}
            />

            <LoginFormButton
              t={t}
              isSubmitting={isSubmitting}
              isPending={loginMutation.isPending}
            />

            {/* kept but hidden by CSS */}
            <div className="login-form-footer">
              <div className="login-form-footer-content">
                <p className="login-form-forgot-text">{t('sections.forgotPassword')}</p>
                <button type="button" className="login-form-forgot-link">
                  {t('actions.contactHelp')}
                </button>
              </div>
            </div>
          </Form>
        </div>
      </div>

      <LoginPageFooter />
    </div>
  );
};
