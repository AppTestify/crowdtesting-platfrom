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
    <header className="w-full border-b bg-white shadow-sm">
      <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-10">
        <div className="flex items-center space-x-2">
          <div className="rounded-sm">
            <Image
              src="/assets/images/logo.png"
              alt="Logo"
              width={120}
              height={120}
            />
          </div>
        </div>

        <div className="flex items-center space-x-3 text-sm text-gray-600">
          <span className="hidden sm:inline">
            {session?.user?.email
              ? `Login as ${session.user.email}`
              : "Not logged in"}
          </span>
          <span className="hidden sm:inline">|</span>
          <button className="flex items-center space-x-1 hover:text-black">
            <HelpCircle size={16} />
            <span className="hidden sm:inline">Help Assistance</span>
          </button>
          <button
            className="flex items-center space-x-1 hover:text-black"
            onClick={() => logOutUser()}
          >
            <LogOut size={16} />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
