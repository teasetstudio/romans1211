import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Middleware configuration for all protected routes
export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/login',
    '/register'
    // Add more protected routes here
  ]
};

// Handle API routes
async function handleApiRoutes(request: NextRequest) {
  const method = request.method;
  const url = request.url;
  console.log(`API Request made: ${method} ${url}`);
  return NextResponse.next();
}

// Handle auth routes (login and register)
async function handleAuthRoutes(request: NextRequest) {
  const token = await getToken({ req: request });

  if (token) {
    // If user is logged in, redirect to home page
    const homeUrl = new URL('/', request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

// Main middleware function
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Handle different route types
  if (path.startsWith('/api')) {
    return handleApiRoutes(request);
  }

  // Handle auth routes
  if (path === '/login' || path === '/register') {
    return handleAuthRoutes(request);
  }

  // Default behavior
  return NextResponse.next();
}
