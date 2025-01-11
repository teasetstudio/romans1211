import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Middleware configuration for all routes
export const config = {
  matcher: [
    // Internationalization routes
    '/',
    '/(ru|en)/:path*',
    // Protected API routes
    '/api/:path*',
    // Auth and public routes (both localized and non-localized)
    '/((?!api|_next|_vercel|.*\\..*).*)',
    '/(ru|en)/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};

// Handle API routes
async function handleApiRoutes(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Skip authentication for NextAuth.js routes
  if (path.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request });
  if (!token) {
    return new NextResponse(
      JSON.stringify({ success: false, message: 'authentication failed' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    );
  }
  return NextResponse.next();
}

// Handle auth routes
async function handleAuthRoutes(request: NextRequest) {
  const token = await getToken({ req: request });
  if (token) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  return NextResponse.next();
}

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const locale = request.nextUrl.pathname.split('/')[1];
  const cleanPath = locale === 'en' || locale === 'ru' ? path.replace(`/${locale}`, '') : path;

  // Handle API routes first
  if (path.startsWith('/api')) {
    return handleApiRoutes(request);
  }

  // Handle auth routes
  if (cleanPath.startsWith('/login') || 
      cleanPath.startsWith('/register') || 
      cleanPath.startsWith('/forgot-password') ||
      cleanPath.startsWith('/reset-password') ||
      cleanPath.startsWith('/verify-email')) {
    const authResult = await handleAuthRoutes(request);
    if (authResult.status !== 200) {
      return authResult;
    }
  }

  // Apply internationalization middleware
  return intlMiddleware(request);
}
