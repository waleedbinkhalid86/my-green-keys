import { updateSession } from '@/lib/supabase/middleware';
import { type NextRequest, NextResponse } from 'next/server';

const protectedRoutes = ['/lesson', '/dashboard', '/pricing'];
const authRoutes = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);

  // Parse the pathname
  const pathname = request.nextUrl.pathname;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Auth state should be determined by Supabase, not hard-coded cookie names.
  const hasSession = !!user;

  // Redirect logic
  if (isProtectedRoute && !hasSession) {
    // Redirect to login if accessing protected route without session
    const redirectResponse = NextResponse.redirect(new URL('/login', request.url));
    // Preserve any refreshed cookies on redirect.
    response.cookies.getAll().forEach((c) => {
      redirectResponse.cookies.set(c.name, c.value, c);
    });
    return redirectResponse;
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
