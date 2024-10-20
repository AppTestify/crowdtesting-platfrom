"use client";
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn, useSession } from "next-auth/react"
import { NextAuthProviders } from "@/app/_constants/next-auth-providers"
import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserRoles } from "@/app/_constants/user-roles"
import { setItem } from "@/app/_services/localstorage"
import { StorageKey } from "@/app/_constants/localstorage-keys"
import Cookies from 'js-cookie';
import { CookieKey } from "@/app/_constants/cookie-keys";
import { AuthIntent } from "@/app/_constants";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signUpSchema } from "@/app/_schemas/auth.schema";
import { SignUpForm } from "@/app/_components/sing-up-form";
import { ErrorCode } from "@/app/_constants/error-codes";
import { useRouter, useSearchParams } from "next/navigation";
import toasterService from "@/app/_services/toaster-service";
import { USER_EXISTS_ERROR_MESSAGE } from "@/app/_constants/errors";

export default function SignUp() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<UserRoles>(UserRoles.CLIENT);

    useEffect(() => {
        Cookies.set(CookieKey.AUTH_INTENT, AuthIntent.SIGN_UP);

        const errorParam = searchParams.get("e");
        if (errorParam === ErrorCode.ERR_SIGN_IN) {
            router.push('/auth/sign-in')
            toasterService.error(USER_EXISTS_ERROR_MESSAGE);
        }

        return () => Cookies.remove(CookieKey.AUTH_INTENT);
    }, []);

    const handleGoogleSignUp = async () => {
        Cookies.set(CookieKey.ROLE, activeTab);
        signIn(NextAuthProviders.GOOGLE, { callbackUrl: `/auth/sign-up` });
    }

    return (
        <div className="flex flex-col p-10 h-full">
            <div className="flex justify-end">
                <Link href={'/auth/sign-in'}>
                    <Button variant="ghost">Login</Button>
                </Link>
            </div>
            <div className="flex items-center justify-center h-4/5">
                <div className="mx-auto grid w-[350px] gap-6">
                    <div className="grid gap-2 text-center">
                        <h1 className="text-3xl font-bold">Create an account</h1>
                        <p className="text-balance text-muted-foreground">
                            Enter your email below to create your account
                        </p>
                    </div>
                    <Tabs defaultValue={UserRoles.CLIENT} className="w-[400px]">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value={UserRoles.CLIENT} onClick={() => setActiveTab(UserRoles.CLIENT)}>Client</TabsTrigger>
                            <TabsTrigger value={UserRoles.TESTER} onClick={() => setActiveTab(UserRoles.TESTER)}>Tester</TabsTrigger>
                        </TabsList>
                        <TabsContent value={UserRoles.CLIENT}>
                            <SignUpForm role={UserRoles.CLIENT} />
                            <Button variant="outline" className="w-full" onClick={() => handleGoogleSignUp()}>
                                Sign up with Google
                            </Button>
                        </TabsContent>
                        <TabsContent value={UserRoles.TESTER}>
                            <SignUpForm role={UserRoles.TESTER} />
                            <Button variant="outline" className="w-full" onClick={() => handleGoogleSignUp()}>
                                Sign up with Google
                            </Button>
                        </TabsContent>
                    </Tabs>
                    <div className="text-muted-foreground text-center">
                        By clicking continue, you agree to our <a href="#" className="underline cursor-pointer">Terms of Service</a> and <a href="#" className="underline cursor-pointer">Privacy Policy</a>.
                    </div>
                </div>
            </div>
        </div>
    )
}
