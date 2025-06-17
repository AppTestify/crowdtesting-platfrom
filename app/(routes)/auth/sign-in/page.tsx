"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { NextAuthProviders } from "@/app/_constants/next-auth-providers";
import { Suspense, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { CookieKey } from "@/app/_constants/cookie-keys";
import { AuthIntent } from "@/app/_constants";
import { ErrorCode } from "@/app/_constants/error-codes";
import { useRouter, useSearchParams } from "next/navigation";
import toasterService from "@/app/_services/toaster-service";
import { USER_UNAUTHORIZED_ERROR_MESSAGE } from "@/app/_constants/errors";
import { SignInForm } from "@/app/_components/sign-in-form";
import { BrandLogo, NewBrandLogo } from "@/app/_components/brand-logo";
import SignInSideContent from "@/app/_components/sign-in-side-content";

function SignInWrapper() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isGoogleSignInDisable, setIsGoogleSignInDisable] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(false);
    Cookies.set(CookieKey.AUTH_INTENT, AuthIntent.SIGN_IN);

    const errorParam = searchParams.get("e");
    if (errorParam === ErrorCode.ERR_SIGN_IN) {
      router.push("/auth/sign-in");
      toasterService.error(USER_UNAUTHORIZED_ERROR_MESSAGE);
    }
    return () => Cookies.remove(CookieKey.AUTH_INTENT);
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    signIn(NextAuthProviders.GOOGLE, {
      callbackUrl: `/auth/sign-in?e=${ErrorCode.ERR_SIGN_IN}`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Left: Login */}
      <div className="w-full md:w-1/2 flex flex-col md:p-8 bg-white shadow-md">
        {/* Logo aligned left */}
        <div className="w-full flex justify-start mb-8">
          <NewBrandLogo className="text-black" />
        </div>

        {/* Centered form content */}
        <div className="w-full max-w-sm mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-center">Welcome Back</h1>
          <p className="text-center text-muted-foreground mb-6">
            Login into your account
          </p>
          <SignInForm setIsGoogleSignInDisable={setIsGoogleSignInDisable} />
        </div>
      </div>

      {/* Right: Role Highlights */}
      <SignInSideContent />
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense>
      <SignInWrapper />
    </Suspense>
  );
}
