"use client";

import { BrandLogo } from "@/app/_components/brand-logo";
import { Navbar } from "@/app/_components/navbar";
import { Icons } from "@/components/icons";
import { usePathname, useRouter } from "next/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const imageSrc = (() => {
    switch (pathname) {
      case "/auth/sign-in":
        return "/assets/images/map-2.png";
      case "/auth/sign-up":
        return "/assets/images/hand.jpg";
      case "/auth/tester-sign-up":
        return "/assets/images/hand.jpg";
      case "/auth/forgot-password":
        return "/assets/images/map-2.png";
      default:
        return "/assets/images/hand.jpg";
    }
  })();

  if (pathname === "/auth/sign-up") {
    return <div className="w-full min-h-screen bg-[#F0F2F5]">{children}</div>;
  }

  return (
    <div className="w-full lg:grid bg-[#F0F2F5] min-h-[100vh] lg:grid-cols-2 ">
      <div className={` ${pathname == "/auth/sign-in" ? "" : ""}`}>
        {pathname === "/auth/forgot-password" ? (
          <div className="bg-[#363E55] h-full hidden lg:flex lg:flex-col justify-center items-start">
            <img
              src={imageSrc}
              alt="Auth Illustration"
              className="w-full max-w-[649px] lg:max-w-[649px] lg:pr-4 transition-all"
            />
          </div>
        ) : pathname !== "/auth/sign-in" ? (
          <div
            className="w-full h-screen bg-cover bg-center relative hidden lg:flex lg:flex-col"
            style={{ backgroundImage: `url(${imageSrc})` }}
          >
            {/* <div className="hidden lg:flex lg:flex-col">
                            <BrandLogo className="text-white" />
                        </div> */}
          </div>
        ) : (
          <section className=" overflow-hidden">{children}</section>
        )}
      </div>
      {pathname !== "/auth/sign-in" ? (
        <section className="">{children}</section>
      ) : (
        <div className="bg-[#363E55] hidden lg:flex lg:flex-col justify-center items-start">
          <img
            src={imageSrc}
            alt="Auth Illustration"
            className="w-full max-w-[649px] lg:max-w-[649px] lg:pr-4 transition-all"
          />
        </div>
      )}
    </div>
  );
}
