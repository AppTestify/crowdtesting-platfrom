"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { NextAuthProviders } from "@/app/_constants/next-auth-providers";
import { Suspense, useEffect, useState } from "react";
import { UserRoles } from "@/app/_constants/user-roles";
import Cookies from "js-cookie";
import { CookieKey } from "@/app/_constants/cookie-keys";
import { AuthIntent } from "@/app/_constants";
import { SignUpForm } from "@/app/_components/sing-up-form";
import { ErrorCode } from "@/app/_constants/error-codes";
import { useRouter, useSearchParams } from "next/navigation";
import toasterService from "@/app/_services/toaster-service";
import { USER_EXISTS_ERROR_MESSAGE } from "@/app/_constants/errors";
import { Loader2 } from "lucide-react";
import { BrandLogo } from "@/app/_components/brand-logo";

function SignUpWrapper() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = UserRoles.TESTER;
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
    <div className="flex flex-col p-5 md:p-10 h-full">
      <BrandLogo className="text-white" />
      <div className="flex items-center justify-center h-4/5 mt-8">
        <div className="mx-auto grid w-full md:w-[380px] gap-6">
          <div className="grid gap-2 text-left md:text-center">
            <h1 className="text-3xl font-bold">Sign up as tester</h1>
            <p className="text-balance text-muted-foreground">
              Enter your email below to create your account
            </p>
          </div>
          <div className="w-full">
            <SignUpForm
              role={UserRoles.TESTER}
              setIsGoogleSignInDisable={setIsGoogleSignInDisable}
            />
            {/* <Button variant="outline" className="w-full" disabled={isGoogleSignInDisable || isLoading} onClick={() => handleGoogleSignUp()}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Sign up with Google
                        </Button> */}
          </div>
        </div>
      </div>
      <div className="mt-6 text-muted-foreground text-left md:text-center">
        By continuing you indicate that you read and <a target="_blank" href="https://apptestify.com/legal/Tester-Terms-Conditions-Privacy.html" className="underline cursor-pointer">agree to the Terms of Use</a>
      </div>
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