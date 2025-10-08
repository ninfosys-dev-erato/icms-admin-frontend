'use client';

import React from 'react';

export const LoginPageFooter: React.FC = () => {
  return (
    <div className="login-page-footer">
      <nav className="login-page-footer-links">
        <a href="#">Contact</a>
        <a href="#">Privacy</a>
        <a href="#">Terms of use</a>
        <a href="#">Accessibility</a>
        <a href="#">Cookie preferences</a>
      </nav>
      <div className="login-page-footer-right">Powered by ICMS</div>
    </div>
  );
};
