"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signInService } from "@/app/_services/auth-service";
import toasterService from "@/app/_services/toaster-service";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { NextAuthProviders } from "@/app/_constants/next-auth-providers";
import Cookies from 'js-cookie';
import { CookieKey } from "@/app/_constants/cookie-keys";
import { AuthIntent } from "@/app/_constants";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(1, { message: "Password is required" }),
  rememberMe: z.boolean().optional()
});

export function SignInForm({ setIsGoogleSignInDisable }: { setIsGoogleSignInDisable: (value: boolean) => void; }) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false
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
      rememberMe: values.rememberMe
    });
    if (response?.error) {
      stopLoading();
      toasterService.error(response.error)
    } else {
      router.push('private/dashboard')
    }
  }

  const startLoading = () => {
    setIsLoading(true);
    setIsGoogleSignInDisable(true);
  }

  const stopLoading = () => {
    setIsLoading(false);
    setIsGoogleSignInDisable(false);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-4 mt-8"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} />
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
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mt-4 flex justify-end">
          {/* <div className="flex items-center space-x-2">
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center">
                    <FormControl>
                      <Switch id="airplane-mode"
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked)}
                      />
                    </FormControl>
                    <FormLabel className="ml-2">Remember me</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div> */}
          <div className="text-red-400 text-sm flex items-center">
            <Link href={'/auth/forgot-password'}>
              Recover Password
            </Link>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Login
        </Button>
      </form>
    </Form>
  );
}