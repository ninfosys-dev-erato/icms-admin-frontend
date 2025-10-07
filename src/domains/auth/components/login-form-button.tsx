
'use client';

import React from 'react';
import { Button } from '@carbon/react';
import { ArrowRight } from '@carbon/icons-react';

type Props = {
  t: (k: string) => string;
  isSubmitting: boolean;
  isPending: boolean;
};

export const LoginFormButton: React.FC<Props> = ({ t, isSubmitting, isPending }) => {
  return (
    <div className="login-form-button-row">
      <Button
        type="submit"
        kind="primary"
        size="lg"
        disabled={isSubmitting || isPending}
        className="login-form-submit"
        renderIcon={(iconProps) => (
          <ArrowRight
            {...iconProps}
            /* inline size: THIS controls the arrow dimensions */
            style={{ width: '60px', height: '30px' }}
          />
        )}
        iconDescription="Continue"
      >
        {isSubmitting || isPending ? 'Signing in...' : t('actions.signIn')}
      </Button>
    </div>
  );
};
