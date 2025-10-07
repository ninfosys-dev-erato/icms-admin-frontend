import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/lib/i18n/routing";
import { AppProviders } from "@/components/providers/app-providers";
import { AuthInitializer } from "@/components/auth/auth-initializer";
import "@/app/globals.css";

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  // Await the params to avoid the Next.js warning
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as "en" | "ne")) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} dir="ltr" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>iCMS - Integrated Content Management System</title>
        <meta
          name="description"
          content="Government-grade content management system"
        />
      </head>
      <body suppressHydrationWarning={true}>
        <AppProviders messages={messages} locale={locale}>
          <AuthInitializer>
            {children}
          </AuthInitializer>
        </AppProviders>
      </body>
    </html>
  );
}
