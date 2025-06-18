"use client";
import Cookies from "js-cookie";
import toasterService from "@/app/_services/toaster-service";
import { signIn } from "next-auth/react";
import { Suspense, useEffect, useState } from "react";
import { UserRoles } from "@/app/_constants/user-roles";
import { CookieKey } from "@/app/_constants/cookie-keys";
import { AuthIntent } from "@/app/_constants";
import { SignUpForm } from "@/app/_components/sign-up-form";
import { ErrorCode } from "@/app/_constants/error-codes";
import { NextAuthProviders } from "@/app/_constants/next-auth-providers";
import { useRouter, useSearchParams } from "next/navigation";
import { USER_EXISTS_ERROR_MESSAGE } from "@/app/_constants/errors";
import { NewBrandLogo } from "@/app/_components/brand-logo";

function SignUpWrapper() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = UserRoles.CLIENT;
  const [isGoogleSignInDisable, setIsGoogleSignInDisable] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(false);
    Cookies.set(CookieKey.AUTH_INTENT, AuthIntent.SIGN_UP);

    const errorParam = searchParams.get("e");
    if (errorParam === ErrorCode.ERR_SIGN_IN) {
      router.push("/auth/sign-in");
      toasterService.error(USER_EXISTS_ERROR_MESSAGE);
    }
    return () => Cookies.remove(CookieKey.AUTH_INTENT);
  }, []);

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    Cookies.set(CookieKey.ROLE, activeTab);
    signIn(NextAuthProviders.GOOGLE, { callbackUrl: `/auth/sign-up` });
  };

  return (
    <div className="min-h-screen relative bg-transparent lg:bg-green-50">
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
        <NewBrandLogo className="w-28 sm:w-32 md:w-36 lg:w-40" />
      </div>
      <SignUpForm
        role={UserRoles.CLIENT}
        setIsGoogleSignInDisable={setIsGoogleSignInDisable}
      />
    </div>
  );
}

export default function SignUp() {
  return (
    <Suspense>
      <div className="overflow-y-auto max-h-screen ">
        <SignUpWrapper />
      </div>
    </Suspense>
  );
}
