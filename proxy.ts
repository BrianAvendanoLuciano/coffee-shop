import { type NextRequest, NextResponse } from 'next/server';

// Protected routes, first line of defence. Proxy (called Middleware before
// Next.js 16) runs before a page renders, so a signed-out visitor is
// redirected without ever downloading the dashboard.
//
// This is only an optimistic check: it sees that a cookie exists, not that it
// is valid. The real check is requireUser() in every API route.
const SESSION_COOKIE = 'pos_session';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isSignedIn = request.cookies.has(SESSION_COOKIE);

  if (pathname === '/auth') {
    return isSignedIn
      ? NextResponse.redirect(new URL('/order', request.url))
      : NextResponse.next();
  }

  if (!isSignedIn) {
    const signIn = new URL('/auth', request.url);
    // Remember where they were going so sign-in can send them back.
    if (pathname !== '/') signIn.searchParams.set('from', pathname);
    return NextResponse.redirect(signIn);
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL('/order', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Everything except API routes, Next internals and files with an extension.
  matcher: ['/((?!api|_next/static|_next/image|.*\\..*).*)'],
};
