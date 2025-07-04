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
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
          {/* Enhanced Header with shadow */}
          <div className="relative z-10">
            <OnboardingHeader />
          </div>
          
          {/* Main Content Area with improved spacing and visual elements */}
          <div className="relative">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl"></div>
            </div>
            
            {/* Content container with improved padding and max-width */}
            <div className="relative z-10 min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-7xl">
                <div className="py-6 sm:py-8 lg:py-12">
                  {children}
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced footer with subtle gradient */}
          <div className="relative z-10 border-t border-gray-200/50 bg-white/60 backdrop-blur-sm">
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
              <p className="text-center text-sm text-gray-600">
                Need help? Contact our support team at{" "}
                <a 
                  href="mailto:support@apptestify.com" 
                  className="font-medium text-green-600 hover:text-green-700 transition-colors"
                >
                  support@apptestify.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </SessionProvider>
  );
}
