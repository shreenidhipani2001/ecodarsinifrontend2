import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const accessToken = req.cookies.get('accessToken');

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/admin'];

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  // If accessing a protected route without authentication, redirect to login
  if (isProtectedRoute && !accessToken) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // If authenticated user tries to access login page, redirect to appropriate dashboard
  if (req.nextUrl.pathname === '/login' && accessToken) {
    // Let the client-side handle the redirect based on role
    // This prevents redirect loops
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login'],
};
