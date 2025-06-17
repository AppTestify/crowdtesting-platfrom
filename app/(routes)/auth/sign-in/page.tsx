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
    // <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
    //   {/* Left: Login */}
    //   <div className="w-full md:w-1/2 flex flex-col md:p-8 bg-white shadow-md">
    //     {/* Logo aligned left */}
    //     <div className="w-full flex justify-start mb-8">
    //       <NewBrandLogo className="text-black" />
    //     </div>

    //     {/* Centered form content */}
    //     <div className="w-full max-w-sm mx-auto">
    //       <h1 className="text-3xl font-bold mb-2 text-center">Welcome Back</h1>
    //       <p className="text-center text-muted-foreground mb-6">
    //         Login into your account
    //       </p>
    //       <SignInForm setIsGoogleSignInDisable={setIsGoogleSignInDisable} />
    //     </div>
    //   </div>

    //   {/* Right: Role Highlights */}
    //   <SignInSideContent />
    // </div>

    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50 max-w-screen-2xl mx-auto">
      {/* Left Side: SignInForm */}
      <div className="w-full lg:w-1/2 flex flex-col p-6 sm:p-6 bg-white shadow-md border-1 border-red-400">
        {/* Logo */}
        <div className="w-full flex justify-start mb-10">
          <NewBrandLogo className="text-black w-24 sm:w-28" />
        </div>

        {/* Content */}
        <div className="w-full max-w-md mx-auto">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2 text-center">
            Welcome Back
          </h1>
          <p className="text-center text-muted-foreground mb-6 text-sm sm:text-base">
            Login into your account
          </p>
          <SignInForm setIsGoogleSignInDisable={setIsGoogleSignInDisable} />
        </div>
      </div>

      {/* Right Side: Informational Content (hidden on mobile) */}
      <div className="hidden lg:flex w-full lg:w-1/2 p-6 xl:p-10 flex-col justify-center bg-green-50 overflow-auto">
        <SignInSideContent />
      </div>
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
