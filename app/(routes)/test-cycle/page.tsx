"use client";

import { BrandLogo } from "@/app/_components/brand-logo";
import { GENERIC_ERROR_MESSAGE } from "@/app/_constants/errors";
import { UserRoles } from "@/app/_constants/user-roles";
import { verifyTestCycleService } from "@/app/_services/test-cycle.service";
import { Button } from "@/components/ui/button";
import { CrossCircledIcon } from "@radix-ui/react-icons";
import { CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function TestCycleWrapper() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isVerifing, setIsVerifing] = useState<boolean>(true);
    const [isActivated, setIsActivated] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [role, setRole] = useState<string>("");

    useEffect(() => {
        const token = searchParams.get("token");
        if (!token) {
            router.push("/auth/login");
        } else {
            verifyAccount(token);
        }
    }, [searchParams]);

    const verifyAccount = async (token: string) => {
        const response = await verifyTestCycleService({ token });
        setRole(response?.role);
        if (response?.isActivated) {
            setIsActivated(true);
            setMessage(response.message || "");
        } else {
            setMessage(response.message || GENERIC_ERROR_MESSAGE);
        }

        setIsVerifing(false);
    };

    const imageSrc = "/assets/images/hand.jpg";

    return (
        <div className="w-full lg:grid bg-[#F0F2F5] min-h-[100vh] lg:grid-cols-2 ">
            <div
                className="w-full h-screen bg-cover bg-center relative hidden lg:flex lg:flex-col"
                style={{ backgroundImage: `url(${imageSrc})` }}
            >
            </div>
            <div className="flex flex-col p-5 md:p-10 h-full">
                <div className="flex justify-end">
                    <Link href={"/auth/sign-in"}>
                        <Button variant="ghost">Login</Button>
                    </Link>
                </div>

                <BrandLogo className="text-primary flex md:hidden mb-7" />

                <div className="flex items-center justify-center h-4/5">
                    <div className="mx-auto grid w-full md:w-[350px] gap-6">
                        <div className="grid gap-2 text-left md:text-center">
                            <h1 className="text-3xl font-bold">Assign test cycle</h1>
                        </div>
                        <div className="w-full">
                            {isVerifing ? (
                                <div className="flex flex-col items-center gap-2 text-center">
                                    <Loader2 className="text-primary animate-spin h-10 w-10" />
                                    <span>
                                        Please give us a moment we are in the middle of assign you in the project.
                                    </span>
                                </div>
                            ) : (
                                <>
                                    {isActivated ? (
                                        <div className="flex flex-col items-center gap-2 text-center">
                                            <CheckCircle className="text-primary h-10 w-10" />
                                            <span>
                                                We assigned you to new test cycle please check{" "}
                                                <Link
                                                    href="/auth/sign-in"
                                                    className="underline p-0 text-black"
                                                >
                                                    Login
                                                </Link>{" "}
                                                to continue.
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-center">
                                            <CrossCircledIcon className="text-destructive h-10 w-10" />
                                            <span>{message}</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        <div className="text-muted-foreground text-left md:text-center">
                            By clicking continue, you agree to our{" "}

                            <a
                                href={`${role === UserRoles.CLIENT ?
                                    "https://apptestify.com/legal/Privacy_Personal%20Data_Protection_Policy.html" :
                                    "https://apptestify.com/legal/Tester-Terms-Conditions-Privacy.html"
                                    }`}
                                className="underline cursor-pointer"
                                target="_blank"
                            >
                                Terms of Service
                            </a>{" "}
                            and{" "}
                            <a
                                href={`${role === UserRoles.CLIENT ?
                                    "https://apptestify.com/legal/Privacy_Personal%20Data_Protection_Policy.html" :
                                    "https://apptestify.com/legal/Tester-Terms-Conditions-Privacy.html"
                                    }`}
                                target="_blank"
                                className="underline cursor-pointer">
                                Privacy Policy
                            </a>
                            .
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function TestCycleEmail() {
    return (
        <Suspense>
            <TestCycleWrapper />
        </Suspense>
    );
}
