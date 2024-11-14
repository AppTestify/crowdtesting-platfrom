"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import { Loader2 } from "lucide-react";
import { BrandLogo } from "@/app/_components/brand-logo";

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
    <div className="flex flex-col p-5 md:p-10 h-full">
      <div className="flex justify-end">
        <Link href={"/auth/sign-up"}>
          <Button variant="ghost">Sign up</Button>
        </Link>
      </div>
      <BrandLogo className="text-primary flex md:hidden mb-7" />

      <div className="flex items-center justify-center h-4/5">
        <div className="mx-auto grid w-full md:w-[350px] gap-6">
          <div className="grid gap-2 text-left md:text-center">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-balance text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>
          <div>
            <SignInForm setIsGoogleSignInDisable={setIsGoogleSignInDisable} />
            {/* <Button variant="outline" className="w-full" disabled={isGoogleSignInDisable || isLoading} onClick={() => handleGoogleSignIn()}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Login with Google
                        </Button> */}
          </div>
          <div className="text-muted-foreground text-left md:text-center">
            By clicking continue, you agree to our{" "}
            <a href="#" className="underline cursor-pointer">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline cursor-pointer">
              Privacy Policy
            </a>
            .
          </div>
        </div>
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
