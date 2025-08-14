"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { NextAuthProviders } from "@/app/_constants/next-auth-providers";
import { Suspense, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { CookieKey } from "@/app/_constants/cookie-keys";
import { AuthIntent } from "@/app/_constants";
import { ErrorCode } from "@/app/_constants/error-codes";
import { useRouter, useSearchParams } from "next/navigation";
import toasterService from "@/app/_services/toaster-service";
import { USER_UNAUTHORIZED_ERROR_MESSAGE } from "@/app/_constants/errors";
import { SignInForm } from "@/app/_components/sign-in-form";
import { BrandLogo, NewBrandLogo } from "@/app/_components/brand-logo";
import { Button } from "@/components/ui/button";
import { Shield, Users, Zap, CheckCircle, Star, ArrowRight } from "lucide-react";

function SignInWrapper() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(false);
    Cookies.set(CookieKey.AUTH_INTENT, AuthIntent.SIGN_IN);

    const errorParam = searchParams.get("e");
    if (errorParam === ErrorCode.ERR_SIGN_IN) {
      router.push("/auth/sign-in");
      toasterService.error(USER_UNAUTHORIZED_ERROR_MESSAGE);
    }
    return () => Cookies.remove(CookieKey.AUTH_INTENT);
  }, []);

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
          
          <div className="relative z-10 flex flex-col justify-center p-12 xl:p-16 text-white">
            {/* Hero Section */}
            <div className="mb-6">
              <h2 className="text-3xl xl:text-4xl font-bold mb-3 leading-tight">
                Streamline Your
                <span className="block text-green-300">QA Process</span>
              </h2>
              <p className="text-lg xl:text-xl text-blue-100 mb-5 leading-relaxed">
                Join thousands of teams using QTM to deliver high-quality software faster
              </p>
              
              {/* Statistics */}
              <div className="grid grid-cols-3 gap-6 mb-5">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-300 mb-1">1000+</div>
                  <div className="text-xs text-blue-200">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-300 mb-1">50K+</div>
                  <div className="text-xs text-blue-200">Test Cases</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-300 mb-1">99.9%</div>
                  <div className="text-xs text-blue-200">Uptime</div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4 mb-5">
              <h3 className="text-xl font-semibold mb-3 text-green-300">
                Why teams choose QTM
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base mb-0.5">Comprehensive Test Management</h4>
                    <p className="text-blue-100 text-sm">Plan, execute, and track all your testing activities in one place</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base mb-0.5">Real-time Collaboration</h4>
                    <p className="text-blue-100 text-sm">Work seamlessly with your team across different roles and departments</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base mb-0.5">Advanced Reporting</h4>
                    <p className="text-blue-100 text-sm">Get insights with detailed analytics and customizable reports</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base mb-0.5">Enterprise Security</h4>
                    <p className="text-blue-100 text-sm">Bank-level security with role-based access controls</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-sm italic mb-2">
                "QTM has transformed our testing process. We've reduced our release cycle time by 40% while improving quality."
              </blockquote>
              <cite className="text-green-300 font-semibold text-sm">
                — Sarah Johnson, QA Manager at TechCorp
              </cite>
            </div>
          </div>
        </div>

        {/* Right Side: SignInForm */}
        <div className="w-full lg:w-5/12 xl:w-2/5 flex flex-col bg-white shadow-2xl relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-green-50/30"></div>
          
          <div className="relative z-10 flex flex-col min-h-screen lg:min-h-0 lg:h-full">
            {/* Header */}
            <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 flex-shrink-0">
              <BrandLogo className="text-gray-800 w-24 sm:w-28 md:w-32 lg:w-36" />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 pb-6 min-h-0">
              <div className="w-full max-w-sm mx-auto">
                {/* Welcome Section */}
                <div className="text-center mb-6">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    Welcome Back
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 mb-4">
                    Sign in to your QTM account
                  </p>
                  
                  {/* Trust Indicators */}
                  <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6 flex-wrap">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Shield className="h-3 w-3 text-green-600" />
                      <span>Secure</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Users className="h-3 w-3 text-blue-600" />
                      <span>Trusted by 1000+</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Zap className="h-3 w-3 text-purple-600" />
                      <span>Fast & Reliable</span>
                    </div>
                  </div>
                </div>

                {/* Sign In Form */}
                <SignInForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense>
      <SignInWrapper />
    </Suspense>
  );
}