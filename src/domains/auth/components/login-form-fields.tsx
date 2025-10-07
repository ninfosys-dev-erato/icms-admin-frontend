
'use client';

import React, { useEffect } from 'react';
import { TextInput, PasswordInput, Checkbox } from '@carbon/react';
import { FieldErrors, UseFormRegister } from 'react-hook-form';

type Props = {
  t: (k: string) => string;
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
};


function useEnsurePasswordEye(inputId: string) {
  useEffect(() => {
    // 1) Locate the actual input (Carbon sometimes wraps and modifies DOM)
    const inputEl =
      (document.getElementById(inputId) as HTMLInputElement | null) ||
      (document.querySelector('input[name="password"]') as HTMLInputElement | null);

    if (!inputEl) return;

    // 2) If Carbon already rendered a toggle, bail out
    const hasCarbonToggle =
      inputEl.closest('.cds--password-input')?.querySelector(
        '[data-toggle-password-visibility], .cds--password-input__visibility__toggle, .cds--text-input--password__visibility__toggle, .cds--text-input__password__visibility__toggle'
      );
    if (hasCarbonToggle) return;

    // 3) Choose a container we can absolutely position inside
    const candidateContainers: (HTMLElement | null)[] = [
      inputEl.closest('.cds--text-input__field-wrapper') as HTMLElement | null,
      inputEl.closest('.cds--password-input') as HTMLElement | null,
      inputEl.parentElement as HTMLElement | null,
    ];
    const container = candidateContainers.find(Boolean) as HTMLElement | undefined;
    if (!container) return;

    // 4) Ensure container can host an absolutely-positioned child
    if (getComputedStyle(container).position === 'static') {
      container.style.position = 'relative';
    }

    // 5) Make sure the input text doesn't sit under the button
    if (!inputEl.style.paddingRight) inputEl.style.paddingRight = '48px';

    // 6) Create and insert the eye only if it's not already there
    const existing = container.querySelector('[data-login-eye-toggle]');
    if (existing) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('data-login-eye-toggle', 'true');
    btn.setAttribute('aria-label', 'Show password');
    Object.assign(btn.style, {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      width: '28px',
      height: '28px',
      padding: '0',
      border: '0',
      background: 'transparent',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '1',
    });

    // Carbon-like eye icon
    btn.innerHTML =
      '<svg viewBox="0 0 32 32" width="20" height="20" aria-hidden="true"><path d="M16 8C9 8 3.7 12.6 2 16c1.7 3.4 7 8 14 8s12.3-4.6 14-8c-1.7-3.4-7-8-14-8zm0 14a6 6 0 110-12 6 6 0 010 12z"></path><circle cx="16" cy="16" r="4"></circle></svg>';

    btn.addEventListener('click', () => {
      const showing = inputEl.type === 'text';
      inputEl.type = showing ? 'password' : 'text';
      btn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
    });

    container.appendChild(btn);

    return () => {
      try { btn.remove(); } catch {}
    };
  }, [inputId]);
}

export const LoginFormFields: React.FC<Props> = ({ t, register, errors }) => {
  // Add the eye for the <PasswordInput id="password" ... />
  useEnsurePasswordEye('password');

  return (
    <div className="login-form-content">
      <div className="login-form-fields">
        <div className="login-form-field font-english-only">
          <TextInput
            id="email"
            labelText={t('form.email.label')}
            placeholder={t('form.email.placeholder')}
            invalid={!!errors.email}
            invalidText={errors.email?.message as string | undefined}
            size="lg"
            {...register('email')}
          />
        </div>

        <div className="login-form-field">
          <PasswordInput
            id="password"
            labelText={t('form.password.label')}
            placeholder={t('form.password.placeholder')}
            invalid={!!errors.password}
            invalidText={errors.password?.message as string | undefined}
            size="lg"
            showPasswordLabel="Show password"
            hidePasswordLabel="Hide password"
            autoComplete="current-password"
            {...register('password')}
          />
        </div>

        <div className="login-form-checkbox">
          <Checkbox
            id="rememberMe"
            labelText={t('form.rememberMe')}
            {...register('rememberMe')}
          />
        </div>
      </div>
    </div>
  );
};
