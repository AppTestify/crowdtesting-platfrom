"use client";

import { BrandLogo } from "@/app/_components/brand-logo";
import { Navbar } from "@/app/_components/navbar";
import { Icons } from "@/components/icons";
import { usePathname, useRouter } from "next/navigation";


export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {

    const pathname = usePathname();
    const imageSrc = (() => {
        switch (pathname) {
            case "/auth/sign-in":
                return "/assets/images/map.jpg";
            case "/auth/sign-up":
                return "/assets/images/Office.png";
            case "/auth/tester-sign-up":
                return "/assets/images/Office.png";
            case "/auth/forgot-password":
                return "/assets/images/map.jpg";
            default:
                return "/assets/images/Office.png";
        }
    })();

    return (
        <div className="w-full lg:grid bg-[#F0F2F5] min-h-[100vh] lg:grid-cols-2 ">
            <div className={` p-6  ${pathname == "/auth/sign-in" ? "" : "pr-12"}`}>
                <BrandLogo className='text-white' />

                {pathname !== "/auth/sign-in" ? (
                    <div className="mt-12 hidden lg:flex lg:flex-col">
                        <img
                            src={imageSrc}
                            className="w-full"
                        />
                    </div>) :
                    (<section>
                        {children}
                    </section>)
                }
            </div>
            {pathname !== "/auth/sign-in" ? (
                <section>
                    {children}
                </section>
            ) :
                (
                    <div className="mt-12 lg:mt-24 hidden lg:flex lg:flex-col justify-center items-start">
                        <img
                            src={imageSrc}
                            alt="Auth Illustration"
                            className="w-full max-w-[649px] lg:max-w-[649px] lg:pr-4 transition-all"
                        />
                    </div>
                )
            }
        </div>
    )
}