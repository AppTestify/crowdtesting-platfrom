"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { Form, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Suspense, useEffect, useState } from "react";
import toasterService from "@/app/_services/toaster-service";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import {
  resetPasswordService,
} from "@/app/_services/auth-service";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { useSearchParams } from "next/navigation";

const forgotPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmedPassword: z
      .string()
      .min(8, "Confirm password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmedPassword, {
    message: "Password must match",
    path: ["confirmedPassword"],
  });

function ResetPasswordWrapper() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState<boolean>(false);
  const [token, setToken] = useState<string>("");
  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    setToken(tokenParam as string);
  }, [searchParams]);

  async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    setIsLoading(true);
    try {
      const totalValue = {
        ...values,
        token: token,
      };
      const response = await resetPasswordService(totalValue);
      if (response) {
        if (response.status === HttpStatusCode.BAD_REQUEST) {
          toasterService.error(response?.message);
          return;
        }
        toasterService.success(response?.message);
      }
    } catch (error) {
      toasterService.error();
    } finally {
      setIsLoading(false);
      form.reset({
        password: "",
        confirmedPassword: "",
      });
    }
  }

  const validateUser = () => {
    if (form.formState.isValid) {
      form.handleSubmit(onSubmit);
    }
  };

  return (
    <div className="flex flex-col p-10 h-full">
      <div className="flex items-center justify-center h-4/5">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} method="post">
            <div className="mx-auto grid w-[350px] gap-6">
              <div className="grid gap-2 text-center">
                <h1 className="text-3xl font-bold">Change password</h1>
                <p className="text-balance text-muted-foreground">
                  Set a new password
                </p>
              </div>
              <div className="grid gap-4">
                <div className="grid gap-2 mt-2">
                  <Label htmlFor="password">Password</Label>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <>
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                id="password"
                                type={isVisible ? 'text' : 'password'}
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setIsVisible(!isVisible)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10"
                              >
                                <span>
                                  {isVisible ? (
                                    <EyeOffIcon className="h-5 w-5 text-gray-500" />
                                  ) : (
                                    <EyeIcon className="h-5 w-5 text-gray-500" />
                                  )}
                                </span>
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </>
                    )}
                  />
                </div>
                <div className="grid gap-2 mt-2">
                  <Label htmlFor="confirmedPassword">Confirm Password</Label>
                  <FormField
                    control={form.control}
                    name="confirmedPassword"
                    render={({ field }) => (
                      <>
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                id="confirmedPassword"
                                type={isConfirmVisible ? 'text' : 'password'}
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setIsConfirmVisible(!isConfirmVisible)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10"
                              >
                                <span>
                                  {isConfirmVisible ? (
                                    <EyeOffIcon className="h-5 w-5 text-gray-500" />
                                  ) : (
                                    <EyeIcon className="h-5 w-5 text-gray-500" />
                                  )}
                                </span>
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </>
                    )}
                  />
                </div>
                <Button
                  type="submit"
                  onClick={() => validateUser()}
                  className="w-full mt-3"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {isLoading ? "Submitting" : "Submit"}
                </Button>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
      <div className="mt-8 text-muted-foreground text-left md:text-center">
        By continuing you indicate that you read and{" "}
        <a href="#" className="underline cursor-pointer">
          agree to the Terms of Use
        </a>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordWrapper />
    </Suspense>
  );
}
