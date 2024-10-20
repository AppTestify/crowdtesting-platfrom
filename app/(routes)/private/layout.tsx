"use client";

import { Navbar } from "@/app/_components/navbar";
import { SessionProvider } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";



export default function PrivateLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname();
    const router = useRouter();

    const handleTabClick = (link: string) => {
        router.push(link);
    };

    return (
        <SessionProvider>
            <section>
                <Navbar />
                {children}
            </section>
        </SessionProvider>
    )
}