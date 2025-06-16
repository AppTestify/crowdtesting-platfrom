"use client";
import Link from "next/link";
import Cookies from "js-cookie";
import toasterService from "@/app/_services/toaster-service";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { Suspense, useEffect, useState } from "react";
import { UserRoles } from "@/app/_constants/user-roles";
import { CookieKey } from "@/app/_constants/cookie-keys";
import { AuthIntent } from "@/app/_constants";
import { SignUpForm } from "@/app/_components/sing-up-form";
import { ErrorCode } from "@/app/_constants/error-codes";
import { NextAuthProviders } from "@/app/_constants/next-auth-providers";
import { useRouter, useSearchParams } from "next/navigation";
import { USER_EXISTS_ERROR_MESSAGE } from "@/app/_constants/errors";
import { Loader2 } from "lucide-react";
import { BrandLogo } from "@/app/_components/brand-logo";

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
    <div>
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
