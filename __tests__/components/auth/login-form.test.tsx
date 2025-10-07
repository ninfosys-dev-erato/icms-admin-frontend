import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoginForm } from '@/domains/auth/components/login-form';

// Mock the translations
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'title': 'Sign In',
      'subtitle': 'Access your iCMS dashboard',
      'form.email.label': 'Email Address',
      'form.email.placeholder': 'Enter your email address',
      'form.password.label': 'Password',
      'form.password.placeholder': 'Enter your password',
      'form.rememberMe': 'Remember me',
      'actions.signIn': 'Sign In',
      'errors.serverError': 'Server error. Please try again later.',
      'errors.invalidCredentials': 'Invalid email or password',
      'errors.rateLimited': 'Too many failed attempts. Please try again later.',
      'errors.networkError': 'Network error. Please check your connection and try again.',
    };
    return translations[key] || key;
  },
}));

// Mock the router
jest.mock('@/lib/i18n/routing', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock the auth hooks
jest.mock('@/hooks/queries/use-auth-queries', () => ({
  useLogin: () => ({
    mutateAsync: jest.fn(),
    isPending: false,
  }),
}));

describe('LoginForm', () => {
  it('renders login form with all required elements', () => {
    render(<LoginForm />);
    
    // Check for main title (use getAllByText to handle multiple elements)
    const signInElements = screen.getAllByText('Sign In');
    expect(signInElements.length).toBeGreaterThan(0);
    
    // Check for subtitle
    expect(screen.getByText('Access your iCMS dashboard')).toBeInTheDocument();
    
    // Check for form fields
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Remember me')).toBeInTheDocument();
    
    // Check for submit button (use getAllByRole to handle multiple buttons)
    const submitButtons = screen.getAllByRole('button', { name: 'Sign In' });
    expect(submitButtons.length).toBeGreaterThan(0);
  });

  it('has proper form structure', () => {
    render(<LoginForm />);
    
    // Check that form exists (Carbon Form doesn't have a form role by default)
    const formElement = screen.getByRole('button', { name: 'Sign In' }).closest('form');
    expect(formElement).toBeInTheDocument();
    
    // Check that email input has proper attributes
    const emailInput = screen.getByLabelText('Email Address');
    expect(emailInput).toHaveAttribute('placeholder', 'Enter your email address');
    
    // Check that password input has proper attributes
    const passwordInput = screen.getByLabelText('Password');
    expect(passwordInput).toHaveAttribute('placeholder', 'Enter your password');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
}); 