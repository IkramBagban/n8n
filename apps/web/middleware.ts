import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    
    // Redirect root to appropriate page based on auth status
    if (pathname === '/') {
      if (token) {
        return NextResponse.redirect(new URL('/home', req.url));
      } else {
        return NextResponse.redirect(new URL('/signin', req.url));
      }
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Allow access to auth pages and API routes without authentication
        if (
          pathname.startsWith('/signin') ||
          pathname.startsWith('/signup') ||
          pathname.startsWith('/api/auth') ||
          pathname.startsWith('/api/rest/auth')
        ) {
          return true;
        }
        
        // Allow root path (will be handled by middleware function above)
        if (pathname === '/') {
          return true;
        }
        
        // Require authentication for all other routes
        return !!token;
      },
    },
    pages: {
      signIn: '/signin',
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth).*)',
  ],
};