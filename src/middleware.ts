import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'aulacim10_session';

// Public pages that are accessible without an active session
const PUBLIC_PAGES = new Set(['/', '/login', '/registro', '/privacidad']);

// Public API endpoints that do not require an active session
const PUBLIC_API_ROUTES = new Set([
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/session-leave',
  '/api/auth/me',
  '/api/health',
]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Static resources and Next.js internal paths pass through
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.') // images, icons, css, fonts, etc.
  ) {
    return NextResponse.next();
  }

  // 2. Public auth API endpoints pass through
  if (PUBLIC_API_ROUTES.has(pathname)) {
    return NextResponse.next();
  }

  // Check for the presence of the session cookie
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const hasSessionToken = Boolean(sessionCookie && sessionCookie.trim().length > 10 && sessionCookie.includes('.'));

  // 3. Protected API Routes: block unauthenticated requests immediately with 401
  if (pathname.startsWith('/api/')) {
    if (!hasSessionToken) {
      return NextResponse.json(
        { error: 'No autorizado. Se requiere sesión autenticada en AulaCIM-10.' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // 4. Public pages (/, /login, /registro)
  if (PUBLIC_PAGES.has(pathname)) {
    // If user already has an active session and visits /login or /registro, redirect to /
    if (hasSessionToken && (pathname === '/login' || pathname === '/registro')) {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = '/';
      return NextResponse.redirect(homeUrl);
    }
    return NextResponse.next();
  }

  // 5. Protected application routes (/perfil, /entrenamiento, /admin, /test/*, /kahoot, etc.)
  // When no session cookie is present, redirect to root '/' (institutional access screen)
  if (!hasSessionToken) {
    const rootUrl = request.nextUrl.clone();
    rootUrl.pathname = '/';
    rootUrl.search = '';
    return NextResponse.redirect(rootUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
