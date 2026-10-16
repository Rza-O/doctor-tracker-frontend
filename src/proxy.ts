import { NextResponse, type NextRequest } from 'next/server';

// Route protection that runs before any page renders (Next 16's "proxy",
// formerly middleware).
//
// It only checks whether an access cookie is PRESENT — it can't verify it (the
// signing secret lives on the API). That's fine: this is a UX layer that avoids
// flashing protected screens to logged-out users. The real security check is
// the API, which verifies every token and role.

const PUBLIC_PATHS = new Set(['/login']);
const ACCESS_COOKIE = 'access_token';

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has(ACCESS_COOKIE);
  const isPublic = PUBLIC_PATHS.has(pathname);

  // Already signed in → skip the login page.
  if (isPublic && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Not signed in → login, remembering the requested page. (If only the
  // 15-minute access cookie expired, the login page silently refreshes the
  // session and sends the user straight back.)
  if (!isPublic && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') loginUrl.searchParams.set('next', pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Everything except the API proxy, Next internals and static files
  // (anything with a file extension), so CSS/JS/images always load.
  matcher: ['/((?!api|_next/static|_next/image|.*\\.\\w+$).*)'],
};
