// components/Header.tsx

import { logOutUserService } from "@/app/_services/auth-service";
import toasterService from "@/app/_services/toaster-service";
import { LogOut, HelpCircle } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function OnboardingHeader() {
  const { data: session } = useSession();
  const router = useRouter();

  const logOutUser = async () => {
    signOut();
    await logOutUserService();
    router.push("/auth/sign-in");
    toasterService.success("Logged out successfully");
  };

  return (
    <header className="w-full border-b border-gray-200/50 bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-50">
      <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Logo Section */}
        <div className="flex items-center space-x-3">
          <div className="rounded-lg p-1">
            <Image
              src="/assets/images/logo.png"
              alt="AppTestify Logo"
              width={120}
              height={40}
              className="h-8 w-auto"
            />
          </div>
          <div className="hidden sm:block h-6 w-px bg-gray-300"></div>
          <div className="hidden sm:block">
            <span className="text-sm font-medium text-gray-600">Onboarding</span>
          </div>
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {/* User Info */}
          <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
            <div className="flex items-center space-x-2 bg-gray-50 rounded-full px-3 py-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium">
                {session?.user?.email ? session.user.email : "Guest"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Help Button */}
            <button className="inline-flex items-center space-x-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200">
              <HelpCircle size={16} />
              <span className="hidden sm:inline">Help</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={() => logOutUser()}
              className="inline-flex items-center space-x-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
