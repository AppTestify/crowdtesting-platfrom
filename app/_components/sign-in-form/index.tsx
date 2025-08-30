"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import toasterService from "@/app/_services/toaster-service";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { NextAuthProviders } from "@/app/_constants/next-auth-providers";
import Cookies from "js-cookie";
import { CookieKey } from "@/app/_constants/cookie-keys";
import { AuthIntent } from "@/app/_constants";
import { useState } from "react";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import Link from "next/link";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
  rememberMe: z.boolean().optional(),
});

export function SignInForm({
  setIsGoogleSignInDisable,
}: {
  setIsGoogleSignInDisable?: (value: boolean) => void;
}) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startLoading();

    Cookies.set(CookieKey.AUTH_INTENT, AuthIntent.SIGN_IN_CREDS);
    const response = await signIn(NextAuthProviders.CREDENTIALS, {
      email: values.email,
      password: values.password,
      authIntent: AuthIntent.SIGN_IN_CREDS,
      redirect: false,
      callbackUrl: `/auth/sign-in/`,
      rememberMe: values.rememberMe,
    });
    if (response?.error) {
      stopLoading();
      toasterService.error(response.error);
    } else {
      router.push("private/dashboard");
    }
  }

  const startLoading = () => {
    setIsLoading(true);
    setIsGoogleSignInDisable?.(true);
  };

  const stopLoading = () => {
    setIsLoading(false);
    setIsGoogleSignInDisable?.(false);
  };

  const handlePasswordVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-4"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-gray-700">Email Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="name@example.com"
                    {...field}
                    className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-gray-700">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={isVisible ? "text" : "password"}
                      {...field}
                      className="h-12 pr-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={handlePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {isVisible ? (
                        <EyeOffIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="rememberMe"
                {...form.register("rememberMe")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="text-sm text-gray-600">
                Remember me
              </label>
            </div>
            <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>

          <div className="text-center">
            <span className="text-gray-600">Don't have an account? </span>
            <Link href="/auth/sign-up" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
              Sign up
            </Link>
          </div>
        </form>
      </Form>
      
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="text-center text-xs text-gray-500 space-y-2">
          <p>&copy; 2025 AppTestify Global Services Pvt. Ltd.</p>
          <div className="flex justify-center gap-4 text-blue-600">
            <Link href="https://apptestify.com/qtm-privacy-policy" target="_blank" className="hover:text-blue-800 transition-colors">
              Privacy Policy
            </Link>
            <Link href="https://apptestify.com/qtm-terms-and-conditions" target="_blank" className="hover:text-blue-800 transition-colors">
              Terms of Use
            </Link>
            <Link href="https://apptestify.com/#contact" target="_blank" className="hover:text-blue-800 transition-colors">
              Contact Us
            </Link>
          </div>
                          <p className="text-gray-400">Apptestify is a product of AppTestify Global Services Pvt. Ltd.</p>
        </div>
      </div>
    </>
  );
}