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
  setIsGoogleSignInDisable: (value: boolean) => void;
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
    setIsGoogleSignInDisable(true);
  };

  const stopLoading = () => {
    setIsLoading(false);
    setIsGoogleSignInDisable(false);
  };

  const handlePasswordVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  return (
    // <Form {...form}>
    //   <form
    //     onSubmit={form.handleSubmit(onSubmit)}
    //     className="w-full max-w-md mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 grid gap-5"
    //   >
    //     <FormField
    //       control={form.control}
    //       name="email"
    //       render={({ field }) => (
    //         <FormItem>
    //           <FormLabel>Email</FormLabel>
    //           <FormControl>
    //             <Input
    //               placeholder="name@example.com"
    //               {...field}
    //               className="text-base"
    //             />
    //           </FormControl>
    //           <FormMessage />
    //         </FormItem>
    //       )}
    //     />
    //     <FormField
    //       control={form.control}
    //       name="password"
    //       render={({ field }) => (
    //         <FormItem>
    //           <FormLabel>Password</FormLabel>
    //           <FormControl>
    //             <div className="relative">
    //               <Input
    //                 type={isVisible ? "text" : "password"}
    //                 {...field}
    //                 className="pr-10"
    //               />
    //               <button
    //                 type="button"
    //                 onClick={handlePasswordVisibility}
    //                 className="absolute right-3 top-1/2 transform -translate-y-1/2"
    //               >
    //                 {isVisible ? (
    //                   <EyeOffIcon className="h-5 w-5 text-gray-500" />
    //                 ) : (
    //                   <EyeIcon className="h-5 w-5 text-gray-500" />
    //                 )}
    //               </button>
    //             </div>
    //           </FormControl>
    //           <FormMessage />
    //         </FormItem>
    //       )}
    //     />

    //     <div className="flex justify-end text-sm text-primary">
    //       <Link href="/auth/forgot-password">Recover Password</Link>
    //     </div>

    //     <Button
    //       type="submit"
    //       className="w-full text-base"
    //       disabled={isLoading}
    //     >
    //       {isLoading && (
    //         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    //       )}
    //       Login
    //     </Button>

    //     <div className="text-center text-sm sm:text-base">
    //       <span>New here?</span>
    //       <Link href="/auth/sign-up">
    //         <span className="ml-2 text-blue-600 hover:underline">
    //           Sign Up!
    //         </span>
    //       </Link>
    //     </div>
    //   </form>
    // </Form>

    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-md mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 grid gap-5"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="name@example.com"
                  {...field}
                  className="text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={isVisible ? "text" : "password"}
                    {...field}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={handlePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {isVisible ? (
                      <EyeOffIcon className="h-5 w-5 text-gray-500" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end text-sm text-primary text-red-500">
          <Link href="/auth/forgot-password">Recover Password</Link>
        </div>

        <Button type="submit" className="w-full text-base" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Login
        </Button>

        <div className="text-center text-sm sm:text-base">
          <span>New here? Create Account </span>
          <Link href="/auth/sign-up">
            <span className="ml-2 text-green-600">Sign Up!</span>
          </Link>
        </div>
      </form>
    </Form>
  );
}
