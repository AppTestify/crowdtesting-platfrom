// components/Header.tsx

import { LogOut, HelpCircle } from "lucide-react";
import Image from "next/image";

export default function OnboardingHeader() {
  return (
    <header className="w-full border-b bg-white shadow-sm">
      <div className="mx-auto flex h-16 items-center justify-between px-6 lg:px-10">
        <div className="flex items-center space-x-2">
          <div className="rounded-sm">
            <Image
              src="/assets/images/logo.png"
              alt="Logo"
              width={100}
              height={100}
            />
          </div>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span className="hidden sm:inline">
            Login as rahul.c@apptestify.com
          </span>
          <span className="hidden sm:inline">|</span>
          <button className="flex items-center space-x-1 hover:text-black">
            <HelpCircle size={16} />
            <span>Help Assistance</span>
          </button>
          <button className="flex items-center space-x-1 hover:text-black">
            <LogOut size={16} />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
