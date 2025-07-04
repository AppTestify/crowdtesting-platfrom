"use client";

import { signIn } from "next-auth/react";
import { NextAuthProviders } from "@/app/_constants/next-auth-providers";
import { Suspense, useEffect, useState } from "react";
import { UserRoles } from "@/app/_constants/user-roles";
import Cookies from "js-cookie";
import { CookieKey } from "@/app/_constants/cookie-keys";
import { AuthIntent } from "@/app/_constants";
import { SignUpForm } from "@/app/_components/sign-up-form";
import { ErrorCode } from "@/app/_constants/error-codes";
import { useRouter, useSearchParams } from "next/navigation";
import toasterService from "@/app/_services/toaster-service";
import { USER_EXISTS_ERROR_MESSAGE } from "@/app/_constants/errors";
import { NewBrandLogo } from "@/app/_components/brand-logo";
import { Shield, Users, Zap, CheckCircle, Star, ArrowRight, Target, TrendingUp, Clock, Gift } from "lucide-react";

function SignUpWrapper() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = UserRoles.CROWD_TESTER;
  const [isGoogleSignInDisable, setIsGoogleSignInDisable] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(false);
    Cookies.set(CookieKey.AUTH_INTENT, AuthIntent.SIGN_UP);

    const errorParam = searchParams.get("e");
    if (errorParam === ErrorCode.ERR_SIGN_IN) {
      router.push("/auth/sign-in");
      toasterService.error(USER_EXISTS_ERROR_MESSAGE);
    }

    return () => Cookies.remove(CookieKey.AUTH_INTENT);
  }, []);

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    Cookies.set(CookieKey.ROLE, activeTab);
    signIn(NextAuthProviders.GOOGLE, { callbackUrl: `/auth/sign-up` });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left Side: Enhanced Content */}
        <div className="hidden lg:flex lg:w-7/12 xl:w-3/5 relative overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-green-600"></div>

          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
          </div>

          <div className="relative z-10 flex flex-col justify-center p-6 sm:p-8 lg:p-10 xl:p-12 text-white">
            {/* Hero Section */}
            <div className="mb-4 sm:mb-6">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-3 leading-tight">
                Start Your
                <span className="block text-green-300">QA Journey</span>
              </h2>
              <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-blue-100 mb-3 sm:mb-4 leading-relaxed">
                Join thousands of teams who trust QTM for comprehensive test management
              </p>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4">
                <div className="text-center">
                  <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-green-300 mb-1">1000+</div>
                  <div className="text-xs sm:text-sm text-blue-200">Happy Teams</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-green-300 mb-1">50K+</div>
                  <div className="text-xs sm:text-sm text-blue-200">Test Cases</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-green-300 mb-1">Free Tier</div>
                  <div className="text-xs sm:text-sm text-blue-200">Available</div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold mb-2 sm:mb-3 text-green-300">
                Everything you need to succeed
              </h3>

              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                    <Target className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-4 lg:w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs sm:text-sm lg:text-base mb-0.5">Complete Test Lifecycle</h4>
                    <p className="text-blue-100 text-xs sm:text-sm">From requirements to defects - manage everything seamlessly</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                    <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-4 lg:w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs sm:text-sm lg:text-base mb-0.5">Team Collaboration</h4>
                    <p className="text-blue-100 text-xs sm:text-sm">Collaborate with testers, developers, and stakeholders in real-time</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                    <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-4 lg:w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs sm:text-sm lg:text-base mb-0.5">Smart Analytics</h4>
                    <p className="text-blue-100 text-xs sm:text-sm">Make data-driven decisions with comprehensive reports and metrics</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                    <Gift className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-4 lg:w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs sm:text-sm lg:text-base mb-0.5">Free Tier Available</h4>
                    <p className="text-blue-100 text-xs sm:text-sm">Start with our free plan and upgrade as your team grows</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trusted by section */}
            <div className="mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm text-blue-200 mb-2">Trusted by leading companies</p>
              <div className="flex items-center gap-2 sm:gap-3 opacity-80 flex-wrap">
                <div className="text-xs sm:text-sm font-semibold bg-white/20 px-2 py-1 rounded-full">AUDIT360</div>
                <div className="text-xs sm:text-sm font-semibold bg-white/20 px-2 py-1 rounded-full">MERCER</div>
                <div className="text-xs sm:text-sm font-semibold bg-white/20 px-2 py-1 rounded-full">OKTO</div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="p-3 sm:p-4 lg:p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="flex items-center gap-1 mb-1 sm:mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-xs sm:text-sm italic mb-1 sm:mb-2">
                "QTM's free tier was perfect for our startup. As we grew, upgrading was seamless and the value is incredible."
              </blockquote>
              <cite className="text-green-300 font-semibold text-xs sm:text-sm">
                — Mike Chen, Lead QA Engineer at StartupXYZ
              </cite>
            </div>
          </div>
        </div>

        {/* Right Side: SignUpForm */}
        <div className="w-full lg:w-5/12 xl:w-2/5 flex flex-col bg-white shadow-2xl relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-green-50/30"></div>

          <div className="relative z-10 flex flex-col min-h-screen lg:min-h-0 lg:h-full">
            {/* Header */}
            <div className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-2 flex-shrink-0">
              <NewBrandLogo className="text-gray-800 w-20 sm:w-24 md:w-28 lg:w-32 xl:w-36" />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8 min-h-0">
              <div className="w-full max-w-sm mx-auto">
                {/* Welcome Section */}
                <div className="text-center mb-4 sm:mb-6 lg:mb-8">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
                  Sign Up as Tester
                  </h1>
                  <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-3 sm:mb-4 lg:mb-6">
                    Start with our free tier or choose a plan that fits your needs
                  </p>

                  {/* Trust Indicators */}
                  <div className="flex items-center justify-center gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 flex-wrap">
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                      <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                      <span>Secure</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                      <Gift className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                      <span>Free Tier</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                      <span>No Credit Card</span>
                    </div>
                  </div>
                </div>

                {/* Sign Up Form */}
                <SignUpForm
                  role={UserRoles.CROWD_TESTER}
                  setIsGoogleSignInDisable={setIsGoogleSignInDisable}
                />
                {/* <Button variant="outline" className="w-full" disabled={isGoogleSignInDisable || isLoading} onClick={() => handleGoogleSignUp()}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Sign up with Google
                        </Button> */}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignUp() {
  return (
    <Suspense>
      <div className="overflow-y-auto max-h-screen ">
        <SignUpWrapper />
      </div>
    </Suspense>
  );
}