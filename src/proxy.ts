import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (token?.role === "STAFF") {
      // Staff cannot access financial/sensitive pages
      const restrictedPaths = ['/', '/reports', '/expenses', '/settings', '/purchases', '/payments', '/audit'];
      
      // If path is exactly '/' or starts with any restricted path
      const isRestricted = restrictedPaths.some(p => path === p || (p !== '/' && path.startsWith(p)));
      
      if (isRestricted) {
        return NextResponse.redirect(new URL('/inventory', req.url));
      }
    }
  },
  {
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
