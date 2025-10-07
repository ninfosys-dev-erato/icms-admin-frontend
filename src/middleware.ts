import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './lib/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Handle authentication
  const token = request.cookies.get('auth-token')?.value;
  const isAuthPage = pathname.includes('/login') || pathname.includes('/auth');
  const isPublicPath = isAuthPage;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check authentication for protected routes
  if (!isPublicPath && !token) {
    // Redirect to login page with locale support
    const loginUrl = new URL(`/admin/login`, request.url);
    
    // Preserve locale if present
    const locale = pathname.split('/')[1];
    if (locale === 'ne') {
      loginUrl.pathname = '/ne/admin/login';
    }
    
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPage && token) {
    const dashboardUrl = new URL('/admin/dashboard', request.url);
    
    // Preserve locale if present
    const locale = pathname.split('/')[1];
    if (locale === 'ne') {
      dashboardUrl.pathname = '/ne/admin/dashboard';
    }
    
    return NextResponse.redirect(dashboardUrl);
  }

  // Handle internationalization
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - API routes
  // - Static files
  // - Images
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}; 