import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("parkpro_token")?.value;
  console.log(token);
  const { pathname } = req.nextUrl;
  console.log(pathname);

  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/login";

  // Allow public routes
  if (!isAdminRoute && !isLoginPage) {
    return NextResponse.next();
  }

  // Not logged in → block admin
  if (!token && isAdminRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Logged in → block login page
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
