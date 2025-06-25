"use client";

import { SidebarInset, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { SessionProvider } from "next-auth/react";
import { AppSidebar } from "@/app/_components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

// Mobile trigger component
function MobileTrigger() {
  const { isMobile, toggleSidebar } = useSidebar();
  
  if (!isMobile) return null;
  
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleSidebar}
      className="fixed top-4 left-4 z-50 md:hidden h-10 w-10 bg-background/95 backdrop-blur-sm border shadow-lg hover:bg-background transition-all duration-200"
      aria-label="Open navigation menu"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}

export default function PrivateLayout({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <SessionProvider>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <MobileTrigger />
                    <main className="w-full pt-4 md:pt-4 pt-20">
                        {children}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </SessionProvider>
    )
}