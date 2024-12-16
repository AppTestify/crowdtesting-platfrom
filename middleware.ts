import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "./app/_lib/session";
import { CookieKey } from "./app/_constants/cookie-keys";

const protectedRoutePattern = "/private";
const authRoutePattern = "/auth";
const verificationRoutePattern = "/auth/verify";
const publicRoutes = ["/auth", "/"];
const forgotPasswordRoutes = "/auth/reset-password";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (path === "/") {
    return NextResponse.redirect(new URL("/auth/sign-in", req.nextUrl));
  }

  const isProtectedRoute = path.startsWith(protectedRoutePattern);
  const isAuthRoute = path.startsWith(authRoutePattern);
  const isVerificationRoute = path.startsWith(verificationRoutePattern);
  const isPublicRoute = publicRoutes.includes(path);
  const isForgotPasswordRoute = path.startsWith(forgotPasswordRoutes);

  if (isProtectedRoute) {
    const cookie = cookies().get(CookieKey.SESSION)?.value;
    const session = await decrypt(cookie);

    if (!session?.user) {
      return NextResponse.redirect(new URL("/auth/sign-in", req.nextUrl));
    }
  }

  if (isForgotPasswordRoute) {
    return NextResponse.next();
  }

  if (isAuthRoute && !isVerificationRoute) {
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
