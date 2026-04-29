import { updateSession } from '@/lib/supabase/middleware';
import { type NextRequest, NextResponse } from 'next/server';

const protectedRoutes = ['/lesson', '/dashboard', '/pricing'];
const authRoutes = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  // Parse the pathname
  const pathname = request.nextUrl.pathname;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Get session from cookies
  const sessionCookie = request.cookies.get('sb-auth-token');
  const hasSession = !!sessionCookie;

  // Redirect logic
  if (isProtectedRoute && !hasSession) {
    // Redirect to login if accessing protected route without session
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthRoute && hasSession) {
    // Optionally redirect to dashboard if already authenticated
    // Uncomment if you want this behavior
    // return NextResponse.redirect(new URL('/lesson', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
