import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import OnboardingHeader from "./_components/header";
import StatusBar from "./_components/status-bar";

export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TooltipProvider>
      <div>
        <OnboardingHeader />

        <div className="min-h-[calc(99.9vh-4rem)] ">{children}</div>
      </div>
    </TooltipProvider>
  );
}
