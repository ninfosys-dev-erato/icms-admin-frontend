'use client';

import React from 'react';

type Props = {
  title: string;
  subtitle: string;
};

export const LoginFormHeader: React.FC<Props> = ({ title, subtitle }) => {
  return (
    <div className="login-form-header">
      <h1 className="login-form-title">{title}</h1>
      <p className="login-form-subtitle">{subtitle}</p>
    </div>
  );
};
