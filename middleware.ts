import { updateSession } from '@/lib/supabase/middleware';
import { type NextRequest, NextResponse } from 'next/server';

/** Kid/student app areas — unauthenticated users go to /kid-login. */
const kidProtectedRoutes = [
  '/lesson',
  '/lesson-map',
  '/games',
  '/report',
  '/home',
  '/brain-sprint',
  '/ranger',
];

/** Parent/teacher dashboards — unauthenticated users go to /login. */
const adultProtectedRoutes = ['/dashboard'];

const authRoutes = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);

  // Parse the pathname
  const pathname = request.nextUrl.pathname;

  const isKidProtectedRoute = kidProtectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAdultProtectedRoute = adultProtectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Auth state should be determined by Supabase, not hard-coded cookie names.
  const hasSession = !!user;

  // Redirect logic
  if ((isKidProtectedRoute || isAdultProtectedRoute) && !hasSession) {
    const loginPath = isKidProtectedRoute ? '/kid-login' : '/login';
    const redirectResponse = NextResponse.redirect(
      new URL(loginPath, request.url)
    );
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
