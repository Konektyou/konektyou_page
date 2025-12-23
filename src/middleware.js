import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Note: localStorage is not accessible in middleware (server-side)
  // Authentication is handled client-side via AdminAuthGuard component
  // This middleware just allows the request to pass through
  
  // Redirect from admin-login if accessing admin routes (client-side will handle auth check)
  // The actual authentication check happens in AdminAuthGuard component
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/admin-login'
  ],
};

