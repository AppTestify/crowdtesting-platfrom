"use client";

import { Navbar } from "@/app/_components/navbar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SessionProvider } from "next-auth/react";
import { AppSidebar } from "@/app/_components/app-sidebar";

export default function PrivateLayout({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <SessionProvider>
            <SidebarProvider>
                <AppSidebar />
                <main className="w-full">
                    <Navbar />
                    {children}
                </main>
            </SidebarProvider>
        </SessionProvider>
    )
}