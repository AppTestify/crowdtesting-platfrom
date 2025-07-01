"use client";
import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import OnboardingHeader from "./_components/header";
import { SessionProvider } from "next-auth/react";

export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <TooltipProvider>
        <div>
          <OnboardingHeader />
          <div className="h-[88vh]">{children}</div>
        </div>
      </TooltipProvider>
    </SessionProvider>
  );
}
