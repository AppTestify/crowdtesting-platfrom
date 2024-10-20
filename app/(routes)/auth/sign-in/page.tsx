"use client"

import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"
import { signIn } from "next-auth/react"
import { NextAuthProviders } from "@/app/_constants/next-auth-providers"
import { useEffect } from "react"
import Cookies from 'js-cookie';
import { CookieKey } from "@/app/_constants/cookie-keys"
import { AuthIntent } from "@/app/_constants"
import { ErrorCode } from "@/app/_constants/error-codes"
import { useRouter, useSearchParams } from "next/navigation"
import toasterService from "@/app/_services/toaster-service"
import { USER_UNAUTHORIZED_ERROR_MESSAGE } from "@/app/_constants/errors"
import { SignInForm } from "@/app/_components/sign-in-form"

export default function SignIn() {
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        Cookies.set(CookieKey.AUTH_INTENT, AuthIntent.SIGN_IN);

        const errorParam = searchParams.get("e");
        if (errorParam === ErrorCode.ERR_SIGN_IN) {
            router.push('/auth/sign-in')
            toasterService.error(USER_UNAUTHORIZED_ERROR_MESSAGE);
        }

        return () => Cookies.remove(CookieKey.AUTH_INTENT);
    }, []);

    const handleGoogleSignIn = async () => {
        signIn(NextAuthProviders.GOOGLE, { callbackUrl: `/auth/sign-in?e=${ErrorCode.ERR_SIGN_IN}` });
    }

    return (
        <div className="flex flex-col p-10 h-full">
            <div className="flex justify-end">
                <Link href={'/auth/sign-up'}>
                    <Button variant="ghost">Sign up</Button>
                </Link>
            </div>
            <div className="flex items-center justify-center h-4/5">
                <div className="mx-auto grid w-[350px] gap-6">
                    <div className="grid gap-2 text-center">
                        <h1 className="text-3xl font-bold">Login</h1>
                        <p className="text-balance text-muted-foreground">
                            Enter your email below to login to your account
                        </p>
                    </div>
                    <div>
                        <SignInForm />
                        <Button variant="outline" className="w-full" onClick={() => handleGoogleSignIn()}>
                            Login with Google
                        </Button>
                    </div>
                    <div className="text-muted-foreground text-center">
                        By clicking continue, you agree to our <a href="#" className="underline cursor-pointer">Terms of Service</a> and <a href="#" className="underline cursor-pointer">Privacy Policy</a>.
                    </div>
                </div>
            </div>
        </div>
    )
}
