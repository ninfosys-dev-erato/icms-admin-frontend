"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { NextIntlClientProvider } from "next-intl";
import { WebTerminalProvider } from "@carbon/ibm-products";
import { queryClient } from "@/lib/query-client";
import { isDevelopment } from "@/lib/env";
import { LanguageFontProvider } from "@/shared/components/language-font-provider";
import { GlobalLoading } from "@/shared/components/global-loading";
import { NotificationProvider } from "@/components/providers/notification-provider";

interface AppProvidersProps {
  children: ReactNode;
  messages: Record<string, unknown>;
  locale: string;
}

export const AppProviders: React.FC<AppProvidersProps> = ({
  children,
  messages,
  locale,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return null;
  }

  return (
    <NextIntlClientProvider
      messages={messages}
      locale={locale}
      timeZone="Asia/Kathmandu"
    >
      <QueryClientProvider client={queryClient}>
        <WebTerminalProvider>
          <LanguageFontProvider>
            {children}
            <GlobalLoading />
            <NotificationProvider />
          </LanguageFontProvider>
        </WebTerminalProvider>
        {isDevelopment() && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </NextIntlClientProvider>
  );
};
