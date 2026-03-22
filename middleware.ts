import { NextRequest, NextResponse } from 'next/server';
import type { NextFetchEvent } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/profile')) {
    const sessionToken = request.cookies.get('sessionToken')?.value;
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Quick base64 decode check
    try {
      Buffer.from(sessionToken, 'base64').toString();
    } catch {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/profile/:path*',
};
