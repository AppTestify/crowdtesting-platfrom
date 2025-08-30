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
import { UserRoles } from "@/app/_constants/user-roles";
import toasterService from "@/app/_services/toaster-service";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { CookieKey } from "@/app/_constants/cookie-keys";
import { AuthIntent } from "@/app/_constants";
import { NextAuthProviders } from "@/app/_constants/next-auth-providers";
import { signIn } from "next-auth/react";
import { ErrorCode } from "@/app/_constants/error-codes";
import Link from "next/link";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countries } from "@/app/_constants/countries";
import { Loader2, EyeIcon, EyeOffIcon } from "lucide-react";

export function SignUpForm({
  role,
  setIsGoogleSignInDisable,
}: {
  role: UserRoles;
  setIsGoogleSignInDisable: (value: boolean) => void;
}) {
  const pathname = usePathname();
  const isClientPage = pathname === "/auth/sign-up";


  const formSchema = isClientPage
    ? z
      .object({
        email: z
          .string()
          .email({ message: "Please enter a valid email address" }),

        password: z
          .string()
          .min(8, { message: "Password must be at least 8 characters" }),

        confirmPassword: z.string(),

        firstName: z.string().min(1, { message: "First name is required" }),

        lastName: z.string().min(1, { message: "Last name is required" }),

        country: z
          .string()
          .min(1, { message: "Please select country" })
          .optional(),

        userCount: z.string().optional(),
        companyName: z
          .string()
          .min(1, { message: "Company name is required" }),
      })
      .refine(
        (data) =>
          data.confirmPassword.length < data.password.length ||
          data.password === data.confirmPassword,
        {
          path: ["confirmPassword"],
          message: "Passwords do not match",
        }
      )
    : z
      .object({
        email: z
          .string()
          .email({ message: "Please enter a valid email address" }),

        password: z
          .string()
          .min(8, { message: "Password must be at least 8 characters" }),

        confirmPassword: z.string(),

        firstName: z.string().min(1, { message: "First name is required" }),

        lastName: z.string().min(1, { message: "Last name is required" }),

        country: z
          .string()
          .min(1, { message: "Please select country" })
          .optional(),

        companyName: z.string().optional(),
      })
      .refine(
        (data) =>
          data.confirmPassword.length < data.password.length ||
          data.password === data.confirmPassword,
        {
          path: ["confirmPassword"],
          message: "Passwords do not match",
        }
      );

  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const defaultValues = isClientPage
    ? {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      country: "",
      userCount: "",
      companyName: "",
    }
    : {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      country: "",
      companyName: "",
    };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Form Data", values);
    startLoading();

    Cookies.set(CookieKey.ROLE, role);
    const response = await signIn(NextAuthProviders.CREDENTIALS, {
      email: values.email,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
      country: values.country,
      authIntent: AuthIntent.SIGN_UP_CREDS,
      redirect: false,
      callbackUrl: `/auth/sign-up?e=${ErrorCode.ERR_SIGN_UP}`,
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
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-2">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <FormField
              name="firstName"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-gray-700">
                    First Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="First name"
                      {...field}
                      className="h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />
            <FormField
              name="lastName"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-gray-700">
                    Last Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Last name"
                      {...field}
                      className="h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />
          </div>

          {/* Email */}
          <FormField
            name="email"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="name@example.com"
                    {...field}
                    className="h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-xs" />
              </FormItem>
            )}
          />

          {/* Password */}
          {/* <FormField
            name="password"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-gray-700">
                  Password <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={isVisible ? "text" : "password"}
                      placeholder="Create a strong password"
                      {...field}
                      className="h-9 pr-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={handlePasswordVisibility}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {isVisible ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-red-500 text-xs" />
              </FormItem>
            )}
          /> */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Password Field */}
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Password<span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className="bg-white pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOffIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password Field */}
            <FormField
              name="confirmPassword"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Confirm Password
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        className="bg-white pr-10"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          form.trigger("confirmPassword");
                        }}
                      />
                      <button
                        type="button"
                        className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOffIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Company & Country (Client only) */}
          {isClientPage && (
            <>
              <FormField
                name="companyName"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-gray-700">
                      Company Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your company name"
                        {...field}
                        className="h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <FormField
                  name="country"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-gray-700">
                        Country <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((c) => (
                              <SelectItem
                                key={c.description}
                                value={c.description}
                              >
                                {c.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />

                {/* Team Size */}
                <FormField
                  name="userCount"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-gray-700">
                        Team Size
                      </FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200">
                            <SelectValue placeholder="How many users?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                            <SelectItem value="5+">5+</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </>
          )}

          {/* Country for non-client */}
          {!isClientPage && (
            <FormField
              name="country"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-gray-700">
                    Country <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="h-9 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200">
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((c) => (
                          <SelectItem
                            key={c.description}
                            value={c.description}
                          >
                            {c.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />
          )}

          {/* Terms Agreement */}
          <div className="flex items-start space-x-2 text-xs">
            <input
              type="checkbox"
              id="agreement"
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
              className="mt-0.5 h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="agreement" className="text-gray-600 leading-relaxed">
              I agree to the{" "}
              <Link
                href="https://apptestify.com/qtm-terms-and-conditions"
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                target="_blank"
              >
                Terms of Use
              </Link>
              ,{" "}
              <Link
                href="https://apptestify.com/qtm-terms-and-conditions"
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                target="_blank"
              >
                Non-Disclosure Agreement
              </Link>
              {" "}and{" "}
              <Link
                href="https://apptestify.com/qtm-privacy-policy"
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                target="_blank"
              >
                Privacy Policy
              </Link>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full h-9 text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            disabled={!isAgreed || isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
            Create Account
          </Button>

          <div className="text-center text-xs">
            <span className="text-gray-600">Already have an account? </span>
            <Link href="/auth/sign-in" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
              Sign in
            </Link>
          </div>
        </form>
      </Form>

      <div className="mt-3 pt-2 border-t border-gray-200">
        <div className="text-center text-xs text-gray-500 space-y-1">
          <p>&copy; 2025 AppTestify Global Services Pvt. Ltd.</p>
          <div className="flex justify-center gap-3 text-blue-600">
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