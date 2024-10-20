import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "./app/_lib/session";
import { CookieKey } from "./app/_constants/cookie-keys";

const protectedRoutePattern = "/private";
const authRoutePattern = "/auth";
const publicRoutes = ["/auth", "/"];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = path.startsWith(protectedRoutePattern);
  const isAuthRoute = path.startsWith(authRoutePattern);
  const isPublicRoute = publicRoutes.includes(path);

  if (isProtectedRoute) {
    const cookie = cookies().get(CookieKey.SESSION)?.value;
    const session = await decrypt(cookie);

    if (!session?.user) {
      return NextResponse.redirect(new URL("/auth/sign-in", req.nextUrl));
    }
  }

  if (isAuthRoute) {
    const cookie = cookies().get(CookieKey.SESSION)?.value;
    const session = await decrypt(cookie);

    if (session?.user) {
      return NextResponse.redirect(new URL("/private/dashboard", req.nextUrl));
    }
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
