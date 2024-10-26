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
    return (
        <div className="w-full lg:grid lg:min-h-[100vh] lg:grid-cols-2 xl:min-h-[100vh]">
            <div className="hidden bg-primary lg:flex lg:flex-col lg:justify-between p-10 pr-16">
                <BrandLogo className='text-white'/>
                
                <div>
                    <p className="text-white font-medium text-lg pb-8">
                        “Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quia provident, cumque possimus architecto ab numquam minima impedit, Dolores architecto commodi deserunt.”</p>
                </div>
            </div>
            <section>
                {children}
            </section>
        </div>
    )
}