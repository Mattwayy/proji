import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const { pathname } = req.nextUrl;
        // Public routes
        if (pathname.startsWith('/login') || pathname.startsWith('/api/auth')) {
          return true;
        }
        // Everything else requires a token
        return !!token;
      },
    },
    pages: { signIn: '/login' },
  },
);

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.jpg).*)',
  ],
};
