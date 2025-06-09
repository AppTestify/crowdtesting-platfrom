import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "./app/_lib/session";
import { CookieKey } from "./app/_constants/cookie-keys";
import { UserRoles } from "./app/_constants/user-roles";

const protectedRoutePattern = "/private";
const onboardingRoutePattern = "/onboarding";
const authRoutePattern = "/auth";
const verificationRoutePattern = "/auth/verify";
const publicRoutes = ["/auth", "/"];
const forgotPasswordRoutes = "/auth/reset-password";
const ponboardingRoutePattern = "/onboarding";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (path === "/") {
    return NextResponse.redirect(new URL("/auth/sign-in", req.nextUrl));
  }

  const isProtectedRoute = path.startsWith(protectedRoutePattern);
  const isOnboardingRoute = path.startsWith(onboardingRoutePattern);
  const isAuthRoute = path.startsWith(authRoutePattern);
  const isVerificationRoute = path.startsWith(verificationRoutePattern);
  const isForgotPasswordRoute = path.startsWith(forgotPasswordRoutes);

  if (isForgotPasswordRoute) {
    return NextResponse.next();
  }

  const cookie = cookies().get(CookieKey.SESSION)?.value;
  const session = await decrypt(cookie);
  const user: any =
    (session?.user && JSON.parse(session?.user?.toString())) || null;

  if (isAuthRoute && !isVerificationRoute) {
    if (user) {
      return NextResponse.redirect(new URL("/private/dashboard", req.nextUrl));
    }
  }

  if (isOnboardingRoute) {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/sign-in", req.nextUrl));
    } else if (user?.projects?.length) {
      return NextResponse.redirect(new URL("/private/dashboard", req.nextUrl));
    }
  }

  if (isProtectedRoute) {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/sign-in", req.nextUrl));
    } else if (!user?.projects?.length && user.role === UserRoles.CLIENT) {
      return NextResponse.redirect(new URL("/onboarding/project", req.nextUrl));
    }
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
