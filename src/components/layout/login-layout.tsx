"use client";

import React, { ReactNode } from "react";
import { Theme, Tile } from "@carbon/react";
import { LanguageSwitcher } from "@/shared/components/language-switcher";
import { AbstractInfographic } from "@/components/ui/abstract-infographic";
import { useTranslations } from "next-intl";
import { useLanguageFont } from "@/shared/hooks/use-language-font";
import { useUIStore } from "@/stores/ui-store";
import './login-layout.css';

interface LoginLayoutProps {
  children: ReactNode;
}

export const LoginLayout: React.FC<LoginLayoutProps> = ({ children }) => {
  const footerT = useTranslations();
  const { isNepali } = useLanguageFont();
  const { theme } = useUIStore();

  return (
    <Theme theme={theme}>
      <div className="login-layout-root fixed-layout">
        {/* Fixed Header */}
        <header className="login-header fixed">
          <h1 className="login-title font-dynamic">iCMS</h1>
          <div className="login-language">
            <LanguageSwitcher variant="button" showLabels={false} />
          </div>
        </header>

        {/* Main area accounts for header/footer height */}
        <main className="login-main" role="main">
          <div className="login-content fullwidth-centered">
            <Tile className="login-tile">{children}</Tile>
            <aside className="illustration-aside">
              <AbstractInfographic className="login-illustration" />
            </aside>
          </div>
        </main>

        {/* Fixed Footer */}
        <footer className="login-footer fixed">
          <div className="footer-links">
            <div className="footer-col left">
              <span className="font-dynamic">{footerT("contact")}</span>
              <span className="font-dynamic">{footerT("privacy")}</span>
              <span className="font-dynamic">{footerT("termsOfUse")}</span>
            </div>
            <div className="footer-col right">
              <span className="font-dynamic">{footerT("accessibility")}</span>
              <span className="font-dynamic">{footerT("cookiePreferences")}</span>
            </div>
          </div>
          <div className="footer-powered font-dynamic">{footerT("poweredBy")}</div>
        </footer>
      </div>
    </Theme>
  );
};
