import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    // This function runs after authorization check
    // All protected routes will have already been validated
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow public access to landing page and login pages
        if (
          pathname === "/" ||
          pathname === "/robots.txt" ||
          pathname === "/sitemap.xml" ||
          pathname === "/opengraph-image" ||
          pathname === "/login" ||
          pathname === "/admin/login"
        ) {
          return true;
        }

        // Protect admin routes - require admin role
        if (pathname.startsWith("/admin")) {
          return token?.role === "admin";
        }

        // Require authentication for all other routes
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
